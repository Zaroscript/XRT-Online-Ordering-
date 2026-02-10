import { CreateItemInput } from '@/types';
import { DEFAULT_QUANTITY_LEVELS, FormValues } from '../item-form-types';

/**
 * Transform modifier assignment data to backend format
 */
export const transformModifierAssignment = (
  values: FormValues,
  allModifiersList: any[],
  itemSizes: any[] | undefined,
): any[] | undefined => {
  if (!values.modifier_assignment) return undefined;

  const selectedGroups = values.modifier_assignment.modifier_groups || [];
  const selectedDefaultModifiers =
    values.modifier_assignment.default_modifiers || [];
  const modifierPrices =
    (values.modifier_assignment as any).modifier_prices || {};
  const modifierPricesBySize =
    (values.modifier_assignment as any).modifier_prices_by_size || {};
  const modifierPricesBySizeAndQuantity =
    (values.modifier_assignment as any).modifier_prices_by_size_and_quantity ||
    {};
  const modifierPricesByQuantity =
    (values.modifier_assignment as any).modifier_prices_by_quantity || {};
  const pricingMode = (values.modifier_assignment as any).pricing_mode || {};

  if (selectedGroups.length === 0) return undefined;

  // Get default modifier IDs
  const defaultModifierIds = Array.isArray(selectedDefaultModifiers)
    ? selectedDefaultModifiers.map((modifier: any) =>
        typeof modifier === 'string' ? modifier : modifier.id,
      )
    : [];

  // Build modifier_groups with modifier_overrides
  return selectedGroups.map((group: any, index: number) => {
    const groupId = typeof group === 'string' ? group : group.id || group._id;

    // Check pricing mode for this group - default to inherit if not set
    const groupPricingMode = pricingMode[groupId] || 'inherit';

    // If inheriting, we do NOT send any overrides for pricing.
    // However, we might still need to send default modifier overrides if the user picked different defaults?
    // The current backend logic likely replaces ALL overrides for a modifier group assignment.
    // So if we send NO overrides, it might revert everything to group defaults.
    // But the request is specific to pricing.
    // If successful implementation requires 'inherit' mode to NOT send price overrides,
    // we should filter out price-related data here.

    // Find all modifiers in this group
    const groupModifiers = allModifiersList.filter(
      (m: any) =>
        (m.modifier_group_id?.id ||
          m.modifier_group_id?._id ||
          m.modifier_group_id) === groupId,
    );

    // Build modifier_overrides for this group
    const modifierOverrides: any[] = [];

    groupModifiers.forEach((modifier: any) => {
      const modifierId = modifier.id || modifier._id;
      const isDefault = defaultModifierIds.includes(modifierId);

      // Check if this modifier has pricing overrides
      const hasSizePricing =
        modifierPricesBySize[modifierId] &&
        Object.keys(modifierPricesBySize[modifierId]).length > 0;
      const hasQuantityPricing =
        modifierPricesBySizeAndQuantity[modifierId] &&
        Object.keys(modifierPricesBySizeAndQuantity[modifierId]).length > 0;
      const flatPrice = modifierPrices[modifierId];
      const hasFlatPricing =
        flatPrice !== undefined && flatPrice !== null && flatPrice !== '';

      const isOverrideMode = groupPricingMode === 'override';

      // Only create override if there's something to override
      // If Inherit Mode: Only override "is_default" status (if changed? - simplifying to always send if default)
      // If Override Mode: Override prices if set

      // Construct override object
      const override: any = {
        modifier_id: modifierId,
      };

      if (isDefault) {
        override.is_default = true;
      }

      if (isOverrideMode) {
        if (hasFlatPricing) {
          override.price = Number(flatPrice);
        }

        // Build prices_by_size array
        if (
          hasSizePricing &&
          values.is_sizeable &&
          itemSizes &&
          itemSizes.length > 0
        ) {
          const pricesBySizeArray: any[] = [];
          const sizePriceData = modifierPricesBySize[modifierId];

          Object.keys(sizePriceData).forEach((sizeName) => {
            const price = sizePriceData[sizeName];
            if (price !== undefined && price !== null && price !== '') {
              const numPrice = Number(price);
              if (!isNaN(numPrice)) {
                // Find size code from itemSizes
                const size = itemSizes.find(
                  (s: any) => s.name === sizeName || s.code === sizeName,
                );
                if (size && size.code) {
                  pricesBySizeArray.push({
                    sizeCode: size.code as any,
                    priceDelta: numPrice,
                  });
                }
              }
            }
          });

          if (pricesBySizeArray.length > 0) {
            override.prices_by_size = pricesBySizeArray;
          }
        }

        // Build quantity_levels array (Sizeable)
        if (
          hasQuantityPricing &&
          values.is_sizeable &&
          itemSizes &&
          itemSizes.length > 0
        ) {
          // ... (existing sizeable logic) ...
          const qtyPriceData = modifierPricesBySizeAndQuantity[modifierId];
          const quantitiesDataMap = new Map<
            number,
            { sizeCode: string; price: number }[]
          >();

          // Collect all prices for each quantity level across all sizes
          Object.keys(qtyPriceData).forEach((sizeIdentifier) => {
            const sizeQtyPrices = qtyPriceData[sizeIdentifier];
            if (sizeQtyPrices && typeof sizeQtyPrices === 'object') {
              // Resolve size code
              const size = itemSizes.find(
                (s: any) =>
                  s.name === sizeIdentifier || s.code === sizeIdentifier,
              );

              if (size && size.code) {
                Object.keys(sizeQtyPrices).forEach((quantity) => {
                  const price = sizeQtyPrices[quantity];
                  if (price !== undefined && price !== null && price !== '') {
                    const numPrice = Number(price);
                    if (!isNaN(numPrice)) {
                      const qty = Number(quantity);
                      if (!quantitiesDataMap.has(qty)) {
                        quantitiesDataMap.set(qty, []);
                      }
                      quantitiesDataMap.get(qty)!.push({
                        sizeCode: size.code,
                        price: numPrice,
                      });
                    }
                  }
                });
              }
            }
          });

          // Build quantity_levels array with prices_by_size
          const quantityLevels: any[] = [];

          quantitiesDataMap.forEach((sizePrices, quantity) => {
            const qtyLevel = DEFAULT_QUANTITY_LEVELS.find(
              (q: any) => q.quantity === quantity,
            );

            if (qtyLevel && sizePrices.length > 0) {
              const pricesBySize = sizePrices.map((sp) => ({
                sizeCode: sp.sizeCode,
                priceDelta: sp.price,
              }));

              quantityLevels.push({
                quantity: quantity,
                name: qtyLevel.name,
                prices_by_size: pricesBySize,
              });
            }
          });

          if (quantityLevels.length > 0) {
            override.quantity_levels = quantityLevels;
          }
        }
        // Build quantity_levels array (Non-Sizeable)
        else if (modifierPricesByQuantity[modifierId]) {
          const qtyPrices = modifierPricesByQuantity[modifierId];
          const quantityLevels: any[] = [];

          Object.keys(qtyPrices).forEach((qty) => {
            const price = qtyPrices[qty];
            const quantity = Number(qty);
            const qtyLevel = DEFAULT_QUANTITY_LEVELS.find(
              (q) => q.quantity === quantity,
            );

            if (
              qtyLevel &&
              price !== undefined &&
              price !== null &&
              price !== ''
            ) {
              quantityLevels.push({
                quantity: quantity,
                name: qtyLevel.name,
                price: Number(price),
              });
            }
          });

          if (quantityLevels.length > 0) {
            override.quantity_levels = quantityLevels;
          }
        }
      }

      // Only add override if it has interesting data (price overrides or is_default)
      // modifier_id is always present (length 1)
      if (Object.keys(override).length > 1) {
        modifierOverrides.push(override);
      }
    });

    return {
      modifier_group_id: groupId,
      display_order: index + 1,
      modifier_overrides:
        modifierOverrides.length > 0 ? modifierOverrides : undefined,
    };
  });
};

/**
 * Build CreateItemInput from form values
 */
export const buildCreateItemInput = (
  values: FormValues,
  shopId: string,
  basePrice: number,
  modifierGroupsForBackend: any[] | undefined,
): CreateItemInput => {
  return {
    name: values.name,
    description: values.description,
    base_price: basePrice,
    category_id: values.category?.id,
    sort_order: values.sort_order ?? undefined,
    max_per_order: values.is_max_per_order_unlimited
      ? undefined
      : (values.max_per_order ?? undefined),
    is_active: values.is_active,
    is_available: values.is_available,
    is_signature: values.is_signature,
    is_sizeable: values.is_sizeable ?? false,
    is_customizable: values.is_customizable ?? false,
    default_size_id: values.is_sizeable ? values.default_size_id : null,
    sizes:
      values.is_sizeable && values.sizes?.length
        ? (values.sizes as any)
        : undefined,
    modifier_groups: modifierGroupsForBackend || values.modifier_groups,
    image: values.image,
    business_id: shopId,
  };
};
