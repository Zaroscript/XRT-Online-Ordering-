import { useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from '@/utils/use-local-storage';
import { FormValues, defaultFormValues } from '../item-form-types';
import { Item } from '@/types';

interface UseItemFormCacheOptions {
  itemId?: string;
  shopId?: string;
  initialValues?: Item | null;
}

interface UseItemFormCacheReturn {
  cacheKey: string;
  cachedFormData: FormValues | null;
  setCachedFormData: (data: FormValues | null) => void;
  imageFileRef: React.MutableRefObject<any>;
  clearCache: () => void;
  getInitialValues: () => FormValues;
}

/**
 * Custom hook for managing item form caching
 */
export const useItemFormCache = ({
  itemId,
  shopId,
  initialValues,
}: UseItemFormCacheOptions): UseItemFormCacheReturn => {
  // Create cache key based on item ID or 'new' for create mode
  const cacheKey = `item-form-cache-${itemId || 'new'}-${shopId || ''}-${
    initialValues?.updated_at || ''
  }`;

  const [cachedFormData, setCachedFormData] =
    useLocalStorage<FormValues | null>(cacheKey, null);

  // Store image file separately (can't serialize to localStorage)
  const imageFileRef = useRef<any>(null);

  // Clear cache function
  const clearCache = useCallback(() => {
    setCachedFormData(null);
    imageFileRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey, setCachedFormData]);

  // Determine initial form values: prioritize cached data, then initialValues, then defaults
  const getInitialValues = useCallback((): FormValues => {
    if (cachedFormData) {
      return cachedFormData;
    }
    if (initialValues) {
      return {
        ...initialValues,
        category: initialValues.category,
        sizes: initialValues.sizes || [],
        is_sizeable:
          initialValues.is_sizeable ||
          (initialValues.sizes && initialValues.sizes.length > 0) ||
          false,
        is_customizable: initialValues.is_customizable || false,
        is_max_per_order_unlimited:
          initialValues.max_per_order == null ||
          initialValues.max_per_order === undefined,
        modifier_assignment: initialValues.modifier_assignment || {
          modifier_groups: [],
          default_modifiers: [],
          assignment_scope: 'ITEM' as const,
        },
        apply_sides: initialValues.apply_sides || false,
        sides: initialValues.sides || {
          both: false,
          left: false,
          right: false,
        },
      };
    }
    return defaultFormValues;
  }, [cachedFormData, initialValues]);

  return {
    cacheKey,
    cachedFormData: cachedFormData ?? null,
    setCachedFormData,
    imageFileRef,
    clearCache,
    getInitialValues,
  };
};

/**
 * Transform initial values from backend to form format
 */
export const transformInitialModifierAssignment = (
  initialValues: Item,
): any => {
  if (
    !initialValues.modifier_groups ||
    initialValues.modifier_groups.length === 0
  ) {
    return initialValues.modifier_assignment;
  }

  // Extract modifier groups and default modifiers from backend structure
  const modifierGroupIds = initialValues.modifier_groups.map((mg: any) => {
    const groupId =
      typeof mg.modifier_group_id === 'object'
        ? mg.modifier_group_id.id ||
          mg.modifier_group_id._id ||
          String(mg.modifier_group_id)
        : mg.modifier_group_id;
    return groupId;
  });

  const defaultModifierIds: string[] = [];
  const pricingData: any = {
    modifier_prices: {},
    modifier_prices_by_quantity: {},
    modifier_prices_by_size: {},
    modifier_prices_by_size_and_quantity: {},
    pricing_mode: {},
  };

  // Extract default modifiers and pricing overrides
  initialValues.modifier_groups.forEach((mg: any) => {
    const groupId =
      typeof mg.modifier_group_id === 'object'
        ? mg.modifier_group_id.id ||
          mg.modifier_group_id._id ||
          String(mg.modifier_group_id)
        : mg.modifier_group_id;

    if (
      mg.modifier_overrides &&
      Array.isArray(mg.modifier_overrides) &&
      mg.modifier_overrides.length > 0
    ) {
      // If there are overrides, set mode to override
      pricingData.pricing_mode[groupId] = 'override';

      mg.modifier_overrides.forEach((override: any) => {
        const modifierId =
          typeof override.modifier_id === 'object'
            ? override.modifier_id.id ||
              override.modifier_id._id ||
              String(override.modifier_id)
            : override.modifier_id;

        // Extract default modifier
        if (override.is_default) {
          defaultModifierIds.push(modifierId);
        }

        // Extract flat price
        if (override.price !== undefined && override.price !== null) {
          pricingData.modifier_prices[modifierId] = override.price;
        }

        // Extract prices_by_size
        if (override.prices_by_size && Array.isArray(override.prices_by_size)) {
          const sizePrices: any = {};
          override.prices_by_size.forEach((priceOverride: any) => {
            if (
              priceOverride.sizeCode &&
              priceOverride.priceDelta !== undefined
            ) {
              sizePrices[priceOverride.sizeCode] = priceOverride.priceDelta;
            }
          });
          if (Object.keys(sizePrices).length > 0) {
            pricingData.modifier_prices_by_size[modifierId] = sizePrices;
          }
        }

        // Extract quantity_levels
        if (
          override.quantity_levels &&
          Array.isArray(override.quantity_levels)
        ) {
          const qtyPrices: any = {};
          override.quantity_levels.forEach((qtyLevel: any) => {
            // Handle new structure: prices_by_size inside quantity_level
            if (
              qtyLevel.prices_by_size &&
              Array.isArray(qtyLevel.prices_by_size)
            ) {
              qtyLevel.prices_by_size.forEach((pbs: any) => {
                if (pbs.sizeCode && pbs.priceDelta !== undefined) {
                  if (!qtyPrices[pbs.sizeCode]) {
                    qtyPrices[pbs.sizeCode] = {};
                  }
                  qtyPrices[pbs.sizeCode][qtyLevel.quantity] = pbs.priceDelta;
                }
              });
            }
            // Handle direct price usage (non-sizeable quantity pricing)
            else if (qtyLevel.price !== undefined) {
              if (!pricingData.modifier_prices_by_quantity[modifierId]) {
                pricingData.modifier_prices_by_quantity[modifierId] = {};
              }
              pricingData.modifier_prices_by_quantity[modifierId][
                qtyLevel.quantity
              ] = qtyLevel.price;
            }
            // Handle legacy structure/fallback (only if needed, but prioritize direct price)
            else {
              const sizeCode = qtyLevel.sizeCode || 'M'; // Fallback
              if (!qtyPrices[sizeCode]) {
                qtyPrices[sizeCode] = {};
              }
              if (
                qtyLevel.quantity !== undefined &&
                qtyLevel.price !== undefined
              ) {
                qtyPrices[sizeCode][qtyLevel.quantity] = qtyLevel.price;
              }
            }
          });

          if (Object.keys(qtyPrices).length > 0) {
            pricingData.modifier_prices_by_size_and_quantity[modifierId] =
              qtyPrices;
          }
        }
      });
    } else {
      // Default to inherit
      pricingData.pricing_mode[groupId] = 'inherit';
    }
  });

  return {
    modifier_groups: modifierGroupIds,
    default_modifiers: defaultModifierIds,
    assignment_scope: 'ITEM' as const,
    modifier_prices: pricingData.modifier_prices,
    modifier_prices_by_size: pricingData.modifier_prices_by_size,
    modifier_prices_by_quantity: pricingData.modifier_prices_by_quantity,
    modifier_prices_by_size_and_quantity:
      pricingData.modifier_prices_by_size_and_quantity,
    pricing_mode: pricingData.pricing_mode,
  };
};
