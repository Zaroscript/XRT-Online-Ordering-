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
  const modifierPricesBySize =
    (values.modifier_assignment as any).modifier_prices_by_size || {};
  const modifierPricesBySizeAndQuantity =
    (values.modifier_assignment as any).modifier_prices_by_size_and_quantity ||
    {};

  if (selectedGroups.length === 0) return undefined;

  // Get default modifier IDs
  const defaultModifierIds = Array.isArray(selectedDefaultModifiers)
    ? selectedDefaultModifiers.map((modifier: any) =>
        typeof modifier === 'string' ? modifier : modifier.id,
      )
    : [];

  // Build modifier_groups with modifier_overrides
  return selectedGroups.map((group: any, index: number) => {
    const groupId = typeof group === 'string' ? group : group.id;

    // Find all modifiers in this group
    const groupModifiers = allModifiersList.filter(
      (m: any) => m.modifier_group_id === groupId,
    );

    // Build modifier_overrides for this group
    const modifierOverrides: any[] = [];

    groupModifiers.forEach((modifier: any) => {
      const modifierId = modifier.id;
      const isDefault = defaultModifierIds.includes(modifierId);

      // Check if this modifier has pricing overrides
      const hasSizePricing =
        modifierPricesBySize[modifierId] &&
        Object.keys(modifierPricesBySize[modifierId]).length > 0;
      const hasQuantityPricing =
        modifierPricesBySizeAndQuantity[modifierId] &&
        Object.keys(modifierPricesBySizeAndQuantity[modifierId]).length > 0;

      // Only create override if there's something to override
      if (isDefault || hasSizePricing || hasQuantityPricing) {
        const override: any = {
          modifier_id: modifierId,
        };

        // Add is_default if it's a default modifier
        if (isDefault) {
          override.is_default = true;
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

        // Build quantity_levels array
        if (
          hasQuantityPricing &&
          values.is_sizeable &&
          itemSizes &&
          itemSizes.length > 0
        ) {
          const qtyPriceData = modifierPricesBySizeAndQuantity[modifierId];
          const quantityLevelMap = new Map<
            number,
            { prices: number[]; count: number }
          >();

          // Collect all prices for each quantity level across all sizes
          Object.keys(qtyPriceData).forEach((sizeName) => {
            const sizeQtyPrices = qtyPriceData[sizeName];
            if (sizeQtyPrices && typeof sizeQtyPrices === 'object') {
              Object.keys(sizeQtyPrices).forEach((quantity) => {
                const price = sizeQtyPrices[quantity];
                if (price !== undefined && price !== null && price !== '') {
                  const numPrice = Number(price);
                  if (!isNaN(numPrice)) {
                    const qty = Number(quantity);
                    if (!quantityLevelMap.has(qty)) {
                      quantityLevelMap.set(qty, { prices: [], count: 0 });
                    }
                    const levelData = quantityLevelMap.get(qty)!;
                    levelData.prices.push(numPrice);
                    levelData.count++;
                  }
                }
              });
            }
          });

          // Build quantity_levels array (using average price if multiple sizes)
          const quantityLevels: any[] = [];
          quantityLevelMap.forEach((levelData, quantity) => {
            const qtyLevel = DEFAULT_QUANTITY_LEVELS.find(
              (q: any) => q.quantity === quantity,
            );

            if (qtyLevel && levelData.prices.length > 0) {
              const avgPrice =
                levelData.prices.reduce((sum, p) => sum + p, 0) /
                levelData.prices.length;
              quantityLevels.push({
                quantity: quantity,
                name: qtyLevel.name,
                price: avgPrice,
              });
            }
          });

          if (quantityLevels.length > 0) {
            override.quantity_levels = quantityLevels;
          }
        }

        // Only add override if it has at least one property
        if (Object.keys(override).length > 1) {
          modifierOverrides.push(override);
        }
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
    max_per_order: values.max_per_order ?? undefined,
    is_active: values.is_active,
    is_available: values.is_available,
    is_signature: values.is_signature,
    is_sizeable: values.is_sizeable ?? false,
    is_customizable: values.is_customizable ?? false,
    default_size_id: values.is_sizeable ? values.default_size_id : null,
    sizes: undefined,
    modifier_groups: modifierGroupsForBackend || values.modifier_groups,
    image: values.image,
    business_id: shopId,
  };
};
