import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import {
  useForm,
  FormProvider,
  Controller,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { itemValidationSchema } from './item-validation-schema';
import {
  Item,
  CreateItemInput,
  UpdateItemInput,
  ItemSize,
  ItemSizeConfig,
  ItemModifierAssignment,
  ItemModifierGroupAssignment,
} from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getErrorMessage } from '@/utils/form-error';
import { useLocalStorage } from '@/utils/use-local-storage';
import { useCreateItemMutation, useUpdateItemMutation } from '@/data/item';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { EditIcon } from '@/components/icons/edit';
import SelectInput from '@/components/ui/select-input';
import { useCategoriesQuery } from '@/data/category';
import SwitchInput from '@/components/ui/switch-input';
import { TrashIcon } from '@/components/icons/trash';
import { useModifierGroupsQuery } from '@/data/modifier-group';
import { useModifiersQuery } from '@/data/modifier';
import ItemSizesManager from './item-sizes-manager';
import { useItemSizesQuery } from '@/data/item-size';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  MobileTabSelect,
} from '@/components/ui/tabs';

// Default quantity levels for all modifiers
const DEFAULT_QUANTITY_LEVELS = [
  { quantity: 1, name: 'Light' },
  { quantity: 2, name: 'Normal' },
  { quantity: 3, name: 'Extra' },
];

type ItemFormProps = {
  initialValues?: Item | null;
};

type FormValues = {
  name: string;
  description?: string;
  base_price?: number; // Used ONLY if is_sizeable = false
  category: any;
  image?: any;
  sort_order?: number | null;
  max_per_order?: number | null;
  is_active?: boolean;
  is_available?: boolean;
  is_signature?: boolean;
  is_sizeable?: boolean;
  is_customizable?: boolean;
  default_size_id?: string | null; // FK to ItemSize.id, required if is_sizeable = true
  sizes?: ItemSizeConfig[]; // Updated to match Item structure
  modifier_groups?: ItemModifierGroupAssignment[]; // Updated to match backend
  modifier_assignment?: ItemModifierAssignment; // Legacy - kept for backward compatibility
  apply_sides?: boolean;
  sides?: {
    both?: boolean;
    left?: boolean;
    right?: boolean;
  };
};

const defaultValues: FormValues = {
  name: '',
  description: '',
  base_price: 0,
  category: null,
  image: '',
  sort_order: 0,
  max_per_order: 0,
  is_active: true,
  is_available: true,
  is_signature: false,
  is_sizeable: false,
  is_customizable: false,
  sizes: [],
  modifier_assignment: {
    modifier_groups: [],
    default_modifiers: [],
    assignment_scope: 'ITEM' as const,
  },
};

export default function CreateOrUpdateItemForm({
  initialValues,
}: ItemFormProps) {
  const router = useRouter();
  const { query, locale } = router;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const imageFileRef = useRef<any>(null); // Store image file separately (can't serialize to localStorage)

  const { data: shopData } = useShopQuery(
    { slug: router.query.shop as string },
    {
      enabled: !!router.query.shop,
    },
  );
  const shopId = (shopData as any)?.id!;

  // Create cache key based on item ID or 'new' for create mode
  const cacheKey = `item-form-cache-${initialValues?.id || 'new'}-${shopId || ''}`;
  const [cachedFormData, setCachedFormData] =
    useLocalStorage<FormValues | null>(cacheKey, null);

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
    return defaultValues;
  }, [cachedFormData, initialValues]);

  const methods = useForm<FormValues>({
    resolver: yupResolver(itemValidationSchema),
    shouldUnregister: false, // Keep fields registered when tabs are hidden to preserve form state
    defaultValues: getInitialValues(),
  });

  // Load cached data on mount (only if no initialValues or if editing the same item)
  useEffect(() => {
    if (
      cachedFormData &&
      (!initialValues ||
        (initialValues.id && cacheKey.includes(initialValues.id)))
    ) {
      // Restore cached form data
      methods.reset(cachedFormData, {
        keepDefaultValues: false,
        keepValues: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      setIsInitialized(true);
    } else if (initialValues) {
      // Transform modifier_groups from backend to form format
      let modifierAssignment = initialValues.modifier_assignment;

      if (
        initialValues.modifier_groups &&
        initialValues.modifier_groups.length > 0
      ) {
        // Extract modifier groups and default modifiers from backend structure
        const modifierGroupIds = initialValues.modifier_groups.map(
          (mg: any) => {
            const groupId =
              typeof mg.modifier_group_id === 'object'
                ? mg.modifier_group_id.id ||
                  mg.modifier_group_id._id ||
                  mg.modifier_group_id
                : mg.modifier_group_id;
            return groupId;
          },
        );

        // Extract default modifiers from modifier_overrides
        const defaultModifierIds: string[] = [];
        const pricingData: any = {
          modifier_prices_by_size: {},
          modifier_prices_by_size_and_quantity: {},
        };

        initialValues.modifier_groups.forEach((mg: any) => {
          if (mg.modifier_overrides && Array.isArray(mg.modifier_overrides)) {
            mg.modifier_overrides.forEach((override: any) => {
              const modifierId =
                typeof override.modifier_id === 'object'
                  ? override.modifier_id.id ||
                    override.modifier_id._id ||
                    override.modifier_id
                  : override.modifier_id;

              if (override.is_default && modifierId) {
                defaultModifierIds.push(modifierId);
              }

              // Reconstruct pricing data
              if (
                override.prices_by_size &&
                Array.isArray(override.prices_by_size)
              ) {
                const sizePrices: any = {};
                override.prices_by_size.forEach((priceOverride: any) => {
                  if (
                    priceOverride.sizeCode &&
                    priceOverride.priceDelta !== undefined
                  ) {
                    sizePrices[priceOverride.sizeCode] =
                      priceOverride.priceDelta;
                  }
                });
                if (Object.keys(sizePrices).length > 0) {
                  pricingData.modifier_prices_by_size[modifierId] = sizePrices;
                }
              }

              if (
                override.quantity_levels &&
                Array.isArray(override.quantity_levels)
              ) {
                const qtyPrices: any = {};
                override.quantity_levels.forEach((qtyLevel: any) => {
                  // Try to find size code from quantity level or use default
                  const sizeCode = qtyLevel.sizeCode || 'M';
                  if (!qtyPrices[sizeCode]) {
                    qtyPrices[sizeCode] = {};
                  }
                  if (
                    qtyLevel.quantity !== undefined &&
                    qtyLevel.price !== undefined
                  ) {
                    qtyPrices[sizeCode][qtyLevel.quantity] = qtyLevel.price;
                  }
                });
                if (Object.keys(qtyPrices).length > 0) {
                  pricingData.modifier_prices_by_size_and_quantity[modifierId] =
                    qtyPrices;
                }
              }
            });
          }
        });

        modifierAssignment = {
          modifier_groups: modifierGroupIds, // Will be populated with full objects by SelectInput
          default_modifiers: defaultModifierIds, // Will be populated with full objects by SelectInput
          assignment_scope: 'ITEM' as const,
          modifier_prices_by_size: pricingData.modifier_prices_by_size,
          modifier_prices_by_size_and_quantity:
            pricingData.modifier_prices_by_size_and_quantity,
        };
      }

      // Use initialValues if no cache or different item
      const formValues: FormValues = {
        ...initialValues,
        category: initialValues.category,
        sizes: initialValues.sizes || [],
        is_sizeable:
          initialValues.is_sizeable || !!initialValues.default_size_id || false,
        default_size_id: initialValues.default_size_id || null,
        is_customizable: initialValues.is_customizable || false,
        modifier_groups: initialValues.modifier_groups || [],
        modifier_assignment: modifierAssignment || {
          modifier_groups: [],
          default_modifiers: [],
          assignment_scope: 'ITEM' as const,
        },
      };
      methods.reset(formValues, {
        keepDefaultValues: false,
        keepValues: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  // Watch all form values for real-time caching
  const formValues = watch();

  // Debounce timer for caching
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save form data to cache in real-time (debounced)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    // Clear previous timeout
    if (cacheTimeoutRef.current) {
      clearTimeout(cacheTimeoutRef.current);
    }

    // Debounce cache saving (500ms delay)
    cacheTimeoutRef.current = setTimeout(() => {
      // Get all form values including hidden tabs using getValues()
      const allFormValues = getValues();

      // Don't cache if form hasn't been touched
      if (!Object.keys(allFormValues).length) return;

      // Create cacheable form data (exclude image file)
      const cacheableData: Partial<FormValues> = {
        ...allFormValues,
        image: allFormValues.image
          ? typeof allFormValues.image === 'string'
            ? allFormValues.image
            : ''
          : undefined,
      };

      // Store image file reference separately (can't serialize to localStorage)
      if (allFormValues.image && typeof allFormValues.image !== 'string') {
        imageFileRef.current = allFormValues.image;
      }

      // Save to cache
      setCachedFormData(cacheableData as FormValues);
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, [formValues, isInitialized, setCachedFormData, getValues]);

  // Load cached image file on mount
  useEffect(() => {
    if (cachedFormData && imageFileRef.current && !initialValues?.image) {
      setValue('image', imageFileRef.current, { shouldValidate: false });
    }
  }, [cachedFormData, initialValues, setValue]);

  const isSizeable = useWatch({
    control,
    name: 'is_sizeable',
    defaultValue: false,
  });

  const defaultSizeId = useWatch({
    control,
    name: 'default_size_id',
    defaultValue: null,
  });

  // Fetch item sizes if editing and item is sizeable
  const { sizes: itemSizes } = useItemSizesQuery(shopId, {
    enabled: !!shopId && isSizeable,
  });

  // Watch selected modifier groups for reactivity
  const selectedModifierGroups =
    useWatch({
      control,
      name: 'modifier_assignment.modifier_groups',
      defaultValue: [],
    }) || [];

  // Auto-set is_sizeable to true if item has default_size_id when editing
  useEffect(() => {
    if (initialValues && initialValues.default_size_id && !isSizeable) {
      setValue('is_sizeable', true, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.id, initialValues?.default_size_id, isSizeable]);

  // Clear cache function
  const clearCache = useCallback(() => {
    setCachedFormData(null);
    imageFileRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey, setCachedFormData]);

  // Custom mutations with cache clearing
  const { mutate: createItem, isPending: creating } = useCreateItemMutation();
  const { mutate: updateItem, isPending: updating } = useUpdateItemMutation();

  // Wrap mutations to clear cache on success
  const handleCreateItem = useCallback(
    (data: CreateItemInput) => {
      createItem(data, {
        onSuccess: () => {
          clearCache();
        },
      });
    },
    [createItem, clearCache],
  );

  const handleUpdateItem = useCallback(
    (data: UpdateItemInput) => {
      updateItem(data, {
        onSuccess: () => {
          clearCache();
        },
      });
    },
    [updateItem, clearCache],
  );

  const { categories, loading: loadingCategories } = useCategoriesQuery({
    limit: 1000,
    language: locale,
    type: 'all', // Adjust type if needed
  });

  // Fetch modifier groups for selection
  const { groups: modifierGroupsRaw, loading: loadingModifierGroups } =
    useModifierGroupsQuery({
      limit: 1000,
      language: locale,
      is_active: true,
    });

  // Filter out any items that look like sizes or size-related modifier groups
  // Modifier groups should have: id, name, display_type, min_select, max_select, etc.
  // Sizes should have: id, name, code, price, display_order, etc.
  // Size-related modifier groups often have names like "Size", "Sizes", or contain size-related modifiers
  const modifierGroups = useMemo(() => {
    if (!modifierGroupsRaw || !Array.isArray(modifierGroupsRaw)) return [];

    // Common size-related keywords to filter out (in group names)
    const sizeKeywords = [
      'size',
      'sizes',
      'portion',
      'portions',
      'dimension',
      'dimensions',
    ];

    // Common size-related modifier names (Small, Medium, Large, etc.)
    const sizeModifierNames = [
      'small',
      'medium',
      'large',
      'extra large',
      'xl',
      'xxl',
      'xs',
      'tiny',
      'huge',
    ];

    return modifierGroupsRaw.filter((group: any) => {
      // Ensure it's a modifier group, not a size
      // Modifier groups have display_type (RADIO/CHECKBOX), sizes have code
      const hasDisplayType =
        group.display_type === 'RADIO' || group.display_type === 'CHECKBOX';
      const hasCode = group.code !== undefined;
      const hasModifierGroupFields =
        group.min_select !== undefined || group.max_select !== undefined;

      // If it has a code field, it's likely a size, not a modifier group
      if (hasCode) return false;

      // Check if the group name suggests it's a size group
      const groupName = (group.name || '').toLowerCase().trim();
      const isSizeGroupByName = sizeKeywords.some((keyword) =>
        groupName.includes(keyword),
      );

      // Check if the group contains modifiers that are actually sizes
      // If the group has modifiers, check if they all look like sizes
      let isSizeGroupByModifiers = false;
      if (
        group.modifiers &&
        Array.isArray(group.modifiers) &&
        group.modifiers.length > 0
      ) {
        // Check if all modifiers in the group are size-related
        const allModifiersAreSizes = group.modifiers.every((modifier: any) => {
          const modifierName = (modifier.name || '').toLowerCase().trim();
          return sizeModifierNames.some(
            (sizeName) =>
              modifierName === sizeName || modifierName.includes(sizeName),
          );
        });

        // If all modifiers are sizes, this is likely a size group
        if (allModifiersAreSizes && group.modifiers.length >= 2) {
          isSizeGroupByModifiers = true;
        }
      }

      const isSizeGroup = isSizeGroupByName || isSizeGroupByModifiers;

      if (isSizeGroup) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🚫 Filtered out size-related modifier group:',
            group.name,
            {
              byName: isSizeGroupByName,
              byModifiers: isSizeGroupByModifiers,
              modifiers: group.modifiers?.map((m: any) => m.name),
            },
          );
        }
        return false;
      }

      // If it has display_type, it's definitely a modifier group (unless it's a size group)
      if (hasDisplayType && !isSizeGroup) return true;

      // If it has modifier group fields (min_select/max_select), it's likely a modifier group
      if (hasModifierGroupFields && !isSizeGroup) return true;

      // Default: include if it doesn't look like a size
      return !hasCode && !isSizeGroup;
    });
  }, [modifierGroupsRaw]);

  // Fetch all modifiers for local filtering
  const { modifiers: allModifiersList, loading: loadingModifiers } =
    useModifiersQuery({
      limit: 1000,
      language: locale,
      is_active: true,
    });

  // Helper function to extract group ID from various formats (for modifiers)
  const getGroupIdFromModifier = (modifierGroupId: any): string | null => {
    if (!modifierGroupId) return null;
    if (typeof modifierGroupId === 'string') return modifierGroupId;
    if (typeof modifierGroupId === 'object') {
      return String(
        modifierGroupId.id ||
          modifierGroupId._id ||
          modifierGroupId.value ||
          '',
      );
    }
    return String(modifierGroupId);
  };

  // Enhanced filtering that also checks modifiers to identify size groups
  const modifierGroupsFiltered = useMemo(() => {
    if (!modifierGroups || !Array.isArray(modifierGroups)) return [];
    if (
      !allModifiersList ||
      !Array.isArray(allModifiersList) ||
      allModifiersList.length === 0
    )
      return modifierGroups;

    // Common size-related modifier names
    const sizeModifierNames = [
      'small',
      'medium',
      'large',
      'extra large',
      'xl',
      'xxl',
      'xs',
      'tiny',
      'huge',
    ];

    // Group modifiers by modifier_group_id to check which groups contain sizes
    const modifiersByGroupId = new Map<string, any[]>();
    allModifiersList.forEach((modifier: any) => {
      const groupId = getGroupIdFromModifier(
        modifier.modifier_group_id ||
          modifier.modifier_group?.id ||
          modifier.modifier_group?._id,
      );
      if (groupId) {
        if (!modifiersByGroupId.has(groupId)) {
          modifiersByGroupId.set(groupId, []);
        }
        modifiersByGroupId.get(groupId)!.push(modifier);
      }
    });

    // Filter out groups that contain only size-related modifiers
    return modifierGroups.filter((group: any) => {
      const groupId = getGroupIdFromModifier(group.id);
      const groupModifiers = modifiersByGroupId.get(groupId) || [];

      // If the group has modifiers, check if they're all sizes
      if (groupModifiers.length > 0) {
        const allModifiersAreSizes = groupModifiers.every((modifier: any) => {
          const modifierName = (modifier.name || '').toLowerCase().trim();
          return sizeModifierNames.some(
            (sizeName) =>
              modifierName === sizeName ||
              modifierName.includes(sizeName) ||
              modifierName.startsWith(sizeName + ' ') ||
              modifierName.endsWith(' ' + sizeName),
          );
        });

        // If all modifiers in the group are sizes and there are at least 2, it's likely a size group
        if (allModifiersAreSizes && groupModifiers.length >= 2) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '🚫 Filtered out size-related modifier group (by modifiers):',
              group.name,
              {
                modifiers: groupModifiers.map((m: any) => m.name),
              },
            );
          }
          return false;
        }
      }

      return true;
    });
  }, [modifierGroups, allModifiersList]);

  // Helper function to extract group ID from various formats
  const getGroupId = (group: any): string | null => {
    if (!group) return null;
    if (typeof group === 'string') return group;
    if (typeof group === 'object') {
      // Try multiple possible ID fields
      return (
        group.id || group._id || group.value || group.modifier_group_id || null
      );
    }
    return String(group);
  };

  // Helper function to extract modifier group ID from modifier object
  const getModifierGroupId = (modifier: any): string | null => {
    if (!modifier) return null;

    // Try multiple possible ways to get the group ID
    // Handle direct modifier_group_id (string or ObjectId)
    if (modifier.modifier_group_id) {
      // If it's an ObjectId object, extract the string
      if (typeof modifier.modifier_group_id === 'object') {
        if (modifier.modifier_group_id._id) {
          return String(modifier.modifier_group_id._id);
        }
        if (modifier.modifier_group_id.toString) {
          return modifier.modifier_group_id.toString();
        }
        // Try to get id or _id from the object
        return String(
          modifier.modifier_group_id.id ||
            modifier.modifier_group_id._id ||
            modifier.modifier_group_id,
        );
      }
      return String(modifier.modifier_group_id);
    }

    // Handle nested modifier_group object
    if (modifier.modifier_group) {
      if (typeof modifier.modifier_group === 'string') {
        return modifier.modifier_group;
      }
      if (typeof modifier.modifier_group === 'object') {
        // Handle ObjectId or regular object
        if (modifier.modifier_group._id) {
          return String(modifier.modifier_group._id);
        }
        return String(
          modifier.modifier_group.id || modifier.modifier_group._id || '',
        );
      }
    }
    return null;
  };

  // Filter modifiers based on selected groups - memoized for performance
  // Initialize with empty array to ensure it's always defined
  const relevantModifiers: any[] =
    useMemo(() => {
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Filtering modifiers:', {
          allModifiersListCount: allModifiersList?.length || 0,
          selectedModifierGroupsCount: selectedModifierGroups?.length || 0,
          selectedModifierGroups: selectedModifierGroups,
          allModifiersList: allModifiersList?.slice(0, 3), // First 3 for debugging
        });
      }

      if (
        !allModifiersList ||
        !Array.isArray(allModifiersList) ||
        allModifiersList.length === 0
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ No modifiers list available');
        }
        return [];
      }
      if (
        !selectedModifierGroups ||
        !Array.isArray(selectedModifierGroups) ||
        selectedModifierGroups.length === 0
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ No modifier groups selected');
        }
        return [];
      }

      // Extract all selected group IDs
      const selectedGroupIds = selectedModifierGroups
        .map(getGroupId)
        .filter((id): id is string => id !== null);

      if (selectedGroupIds.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ No valid group IDs extracted from selected groups');
        }
        return [];
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Selected group IDs:', selectedGroupIds);
        // Log first few modifiers to see their structure
        console.log(
          '🔍 First 5 modifiers structure:',
          allModifiersList.slice(0, 5).map((m: any) => ({
            id: m.id,
            name: m.name,
            modifier_group_id: m.modifier_group_id,
            modifier_group: m.modifier_group,
            fullModifier: m,
          })),
        );
      }

      // Filter modifiers that belong to any of the selected groups
      const filtered = allModifiersList.filter((m: any) => {
        if (!m) return false;

        // Use helper function to get modifier group ID
        const modifierGroupId = getModifierGroupId(m);

        if (!modifierGroupId) {
          if (
            process.env.NODE_ENV === 'development' &&
            allModifiersList.indexOf(m) < 5
          ) {
            console.log('⚠️ Modifier missing group ID:', {
              modifierId: m.id,
              modifierName: m.name,
              modifier_group_id: m.modifier_group_id,
              modifier_group: m.modifier_group,
              fullModifier: m,
            });
          }
          return false;
        }

        // Compare as strings to handle type mismatches
        const matches = selectedGroupIds.some((groupId) => {
          const match =
            String(modifierGroupId).trim() === String(groupId).trim();
          if (process.env.NODE_ENV === 'development') {
            if (allModifiersList.indexOf(m) < 5) {
              console.log('🔍 Comparing:', {
                modifierId: m.id,
                modifierName: m.name,
                modifierGroupId: String(modifierGroupId),
                groupId: String(groupId),
                match: match,
              });
            }
            if (match) {
              console.log('✅ Match found:', {
                modifierId: m.id,
                modifierName: m.name,
                modifierGroupId: String(modifierGroupId),
                groupId: String(groupId),
              });
            }
          }
          return match;
        });

        return matches;
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Filtered modifiers count:', filtered.length);
      }

      return filtered;
    }, [allModifiersList, selectedModifierGroups]) || [];

  // Populate modifier groups and modifiers with full objects when data loads
  useEffect(() => {
    if (isInitialized && modifierGroups && allModifiersList && initialValues) {
      const currentValues = getValues();
      if (currentValues.modifier_assignment?.modifier_groups) {
        const populatedGroups =
          currentValues.modifier_assignment.modifier_groups.map(
            (group: any) => {
              if (typeof group === 'string') {
                return modifierGroups.find((g: any) => g.id === group) || group;
              }
              return group;
            },
          );

        const populatedModifiers =
          currentValues.modifier_assignment.default_modifiers?.map(
            (modifier: any) => {
              if (typeof modifier === 'string') {
                return (
                  allModifiersList.find((m: any) => m.id === modifier) ||
                  modifier
                );
              }
              return modifier;
            },
          ) || [];

        if (
          populatedGroups.some(
            (g: any, idx: number) =>
              g !== currentValues.modifier_assignment.modifier_groups[idx],
          )
        ) {
          setValue('modifier_assignment.modifier_groups', populatedGroups, {
            shouldValidate: false,
          });
        }

        if (
          populatedModifiers.some(
            (m: any, idx: number) =>
              m !== currentValues.modifier_assignment.default_modifiers?.[idx],
          )
        ) {
          setValue(
            'modifier_assignment.default_modifiers',
            populatedModifiers,
            { shouldValidate: false },
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifierGroups, allModifiersList, isInitialized, initialValues?.id]);

  const onSubmit = async (values: any) => {
    let basePrice: number | undefined = undefined;

    // Pricing logic:
    // - If is_sizeable = false: base_price is required and used
    // - If is_sizeable = true: base_price is ignored, default_size_id is required
    if (!values.is_sizeable) {
      basePrice = values.base_price ?? 0;
      if (!basePrice || basePrice <= 0) {
        setError('base_price', {
          type: 'manual',
          message: t('form:error-base-price-required'),
        });
        return;
      }
    } else {
      // For sizeable items, base_price is ignored
      basePrice = 0; // Backend expects 0 when is_sizeable = true
      if (!values.default_size_id) {
        setError('default_size_id', {
          type: 'manual',
          message: t('form:error-default-size-required'),
        });
        return;
      }
    }

    // Transform modifier assignment data to backend format
    let modifierGroupsForBackend: any[] | undefined = undefined;

    if (values.modifier_assignment) {
      const selectedGroups = values.modifier_assignment.modifier_groups || [];
      const selectedDefaultModifiers =
        values.modifier_assignment.default_modifiers || [];
      const modifierPricesBySize =
        values.modifier_assignment.modifier_prices_by_size || {};
      const modifierPricesBySizeAndQuantity =
        values.modifier_assignment.modifier_prices_by_size_and_quantity || {};

      if (selectedGroups.length > 0) {
        // Get default modifier IDs
        const defaultModifierIds = Array.isArray(selectedDefaultModifiers)
          ? selectedDefaultModifiers.map((modifier: any) =>
              typeof modifier === 'string' ? modifier : modifier.id,
            )
          : [];

        // Build modifier_groups with modifier_overrides
        modifierGroupsForBackend = selectedGroups.map(
          (group: any, index: number) => {
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
                Object.keys(modifierPricesBySizeAndQuantity[modifierId])
                  .length > 0;

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
                          (s: any) =>
                            s.name === sizeName || s.code === sizeName,
                        );
                        if (size && size.code) {
                          // Use size.code directly (backend will validate)
                          pricesBySizeArray.push({
                            sizeCode: size.code as any, // Type assertion for backend compatibility
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
                // Note: quantity_levels in ItemModifierOverride are NOT size-specific
                // They apply to all sizes. If we have size+quantity pricing, we need to handle it differently.
                // For now, we'll use the first size's pricing or average if multiple sizes have different prices
                if (
                  hasQuantityPricing &&
                  values.is_sizeable &&
                  itemSizes &&
                  itemSizes.length > 0
                ) {
                  const qtyPriceData =
                    modifierPricesBySizeAndQuantity[modifierId];
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
                        if (
                          price !== undefined &&
                          price !== null &&
                          price !== ''
                        ) {
                          const numPrice = Number(price);
                          if (!isNaN(numPrice)) {
                            const qty = Number(quantity);
                            if (!quantityLevelMap.has(qty)) {
                              quantityLevelMap.set(qty, {
                                prices: [],
                                count: 0,
                              });
                            }
                            const levelData = quantityLevelMap.get(qty)!;
                            levelData.prices.push(numPrice);
                            levelData.count++;
                          }
                        }
                      });
                    }
                  });

                  // Build quantity_levels array (using average price if multiple sizes have different prices)
                  const quantityLevels: any[] = [];
                  quantityLevelMap.forEach((levelData, quantity) => {
                    const qtyLevel = DEFAULT_QUANTITY_LEVELS.find(
                      (q: any) => q.quantity === quantity,
                    );

                    if (qtyLevel && levelData.prices.length > 0) {
                      // Use average price if multiple sizes have different prices
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
                  // More than just modifier_id
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
          },
        );
      }
    }

    const inputValues: CreateItemInput = {
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
      // Legacy sizes array - kept for backward compatibility but not used if using ItemSize API
      sizes: undefined,
      // Updated modifier_groups structure - properly formatted for backend
      modifier_groups: modifierGroupsForBackend || values.modifier_groups,
      image: values.image,
      business_id: shopId,
    };

    try {
      if (!initialValues) {
        handleCreateItem(inputValues);
      } else {
        handleUpdateItem({
          ...inputValues,
          id: initialValues.id,
        });
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Tabs defaultTab="basic" className="w-full">
            <TabList>
              <Tab id="basic">{t('form:tab-basic-information')}</Tab>
              <Tab id="sizes">{t('form:tab-sizes')}</Tab>
              <Tab id="image">{t('form:tab-image')}</Tab>
              <Tab id="modifiers">{t('form:tab-modifiers')}</Tab>
              <Tab id="settings">{t('form:tab-settings')}</Tab>
            </TabList>

            <MobileTabSelect
              tabs={[
                { id: 'basic', label: t('form:tab-basic-information') },
                { id: 'sizes', label: t('form:tab-sizes') },
                { id: 'image', label: t('form:tab-image') },
                { id: 'modifiers', label: t('form:tab-modifiers') },
                { id: 'settings', label: t('form:tab-settings') },
              ]}
            />

            {/* Basic Information Tab */}
            <TabPanel id="basic">
              <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                  title={t('form:item-description')}
                  details={`${
                    initialValues
                      ? t('form:item-description-edit')
                      : t('form:item-description-add')
                  }`}
                  className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />

                <Card className="w-full sm:w-8/12 md:w-2/3">
                  <Input
                    label={`${t('form:input-label-name')}*`}
                    {...register('name')}
                    error={t(errors.name?.message!)}
                    variant="outline"
                    placeholder={t('form:input-placeholder-item-name')}
                    className="mb-5"
                  />

                  <TextArea
                    label={t('form:input-label-description')}
                    {...register('description')}
                    error={t(errors.description?.message!)}
                    variant="outline"
                    className="mb-5"
                  />

                  <div className="mb-5">
                    <SwitchInput
                      name="is_sizeable"
                      control={control}
                      label={t('form:input-label-sizeable')}
                    />
                  </div>

                  {!isSizeable && (
                    <Input
                      label={`${t('form:input-label-base-price')}*`}
                      {...register('base_price')}
                      type="number"
                      error={t(errors.base_price?.message!)}
                      variant="outline"
                      className="mb-5"
                    />
                  )}

                  <div className="mb-5">
                    <Label>{t('form:input-label-category')}*</Label>
                    <SelectInput
                      name="category"
                      control={control}
                      getOptionLabel={(option: any) => option.name}
                      getOptionValue={(option: any) => option.id}
                      options={categories}
                      isLoading={loadingCategories}
                    />
                    {errors.category?.message && (
                      <p className="my-2 text-xs text-red-500">
                        {t(errors.category.message)}
                      </p>
                    )}
                  </div>

                  <Input
                    label={t('form:input-label-sort-order')}
                    {...register('sort_order')}
                    type="number"
                    error={t(errors.sort_order?.message!)}
                    variant="outline"
                    className="mb-5"
                  />

                  <Input
                    label={t('form:input-label-max-per-order')}
                    {...register('max_per_order')}
                    type="number"
                    error={t(errors.max_per_order?.message!)}
                    variant="outline"
                    className="mb-5"
                  />
                </Card>
              </div>
            </TabPanel>

            {/* Sizes Tab */}
            <TabPanel id="sizes">
              <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                  title={t('form:input-label-sizes')}
                  details={t('form:item-sizes-help-text')}
                  className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />
                <Card className="w-full sm:w-8/12 md:w-2/3">
                  {!isSizeable ? (
                    <Alert
                      message={t('form:enable-sizeable-first')}
                      variant="info"
                    />
                  ) : (
                    <>
                      {initialValues?.id || shopId ? (
                        <Controller
                          name="sizes"
                          control={control}
                          render={({ field }) => (
                            <ItemSizesManager
                              businessId={shopId}
                              value={field.value}
                              onChange={field.onChange}
                              defaultSizeId={defaultSizeId || undefined}
                              onDefaultSizeChange={(sizeId) => {
                                setValue('default_size_id', sizeId, {
                                  shouldValidate: true,
                                });
                                // Also set default flag in the config array
                                if (sizeId) {
                                  const currentSizes = field.value || [];
                                  const newSizes = currentSizes.map(
                                    (s: any) => ({
                                      ...s,
                                      is_default: s.size_id === sizeId,
                                    }),
                                  );
                                  field.onChange(newSizes);
                                }
                              }}
                            />
                          )}
                        />
                      ) : (
                        <Alert
                          message={t('form:save-item-first-to-manage-sizes')}
                          variant="info"
                        />
                      )}
                      {errors.default_size_id && (
                        <p className="mt-2 text-xs text-red-500">
                          {t(errors.default_size_id.message!)}
                        </p>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </TabPanel>

            {/* Image Tab */}
            <TabPanel id="image">
              <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                  title={t('form:featured-image-title')}
                  details={t('form:featured-image-help-text')}
                  className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />

                <Card className="w-full sm:w-8/12 md:w-2/3">
                  <FileInput name="image" control={control} multiple={false} />
                </Card>
              </div>
            </TabPanel>

            {/* Modifiers Tab */}
            <TabPanel id="modifiers">
              <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                  title={t('form:input-label-modifiers')}
                  details={t('form:item-modifiers-help-text')}
                  className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />
                <Card className="w-full sm:w-8/12 md:w-2/3">
                  <div className="mb-5">
                    <Label>{t('form:input-label-modifier-groups')}</Label>
                    <SelectInput
                      name="modifier_assignment.modifier_groups"
                      control={control}
                      getOptionLabel={(option: any) => option.name}
                      getOptionValue={(option: any) => option.id}
                      options={modifierGroupsFiltered || []}
                      isMulti
                      isClearable
                      isLoading={loadingModifierGroups}
                      placeholder={t(
                        'form:input-placeholder-select-modifier-groups',
                      )}
                    />
                  </div>

                  <Controller
                    name="modifier_assignment.default_modifiers"
                    control={control}
                    render={({ field }) => {
                      return (
                        <div className="mb-5">
                          <Label>
                            {t('form:input-label-default-modifiers')}
                          </Label>
                          <SelectInput
                            name="modifier_assignment.default_modifiers"
                            control={control}
                            getOptionLabel={(option: any) => option.name}
                            getOptionValue={(option: any) => option.id}
                            options={relevantModifiers}
                            isMulti
                            isClearable
                            isLoading={loadingModifiers}
                            placeholder={
                              loadingModifiers
                                ? t('form:loading-modifiers')
                                : t(
                                    'form:input-placeholder-select-default-modifiers',
                                  )
                            }
                            isDisabled={
                              selectedModifierGroups.length === 0 ||
                              loadingModifiers
                            }
                          />
                          {selectedModifierGroups.length === 0 && (
                            <p className="mt-2 text-xs text-gray-500">
                              {t('form:select-modifier-groups-first')}
                            </p>
                          )}
                          {selectedModifierGroups.length > 0 &&
                            !loadingModifiers &&
                            relevantModifiers.length === 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-yellow-600">
                                  {t('form:no-modifiers-found')}
                                </p>
                                {process.env.NODE_ENV === 'development' && (
                                  <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer">
                                      Debug Info
                                    </summary>
                                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                      <p>
                                        All Modifiers Count:{' '}
                                        {allModifiersList?.length || 0}
                                      </p>
                                      <p>
                                        Selected Groups Count:{' '}
                                        {selectedModifierGroups?.length || 0}
                                      </p>
                                      <p>
                                        Selected Group IDs:{' '}
                                        {JSON.stringify(
                                          selectedModifierGroups
                                            ?.map(getGroupId)
                                            .filter(Boolean),
                                        )}
                                      </p>
                                      <p>
                                        First 3 Modifiers:{' '}
                                        {JSON.stringify(
                                          allModifiersList
                                            ?.slice(0, 3)
                                            .map((m: any) => ({
                                              id: m.id,
                                              name: m.name,
                                              modifier_group_id:
                                                m.modifier_group_id ||
                                                m.modifier_group?.id,
                                            })),
                                        )}
                                      </p>
                                    </div>
                                  </details>
                                )}
                              </div>
                            )}
                          {loadingModifiers && (
                            <p className="mt-2 text-xs text-gray-500">
                              {t('form:loading-modifiers')}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* Modifier Prices by Size and Quantity Levels - Only show if item is sizeable */}
                  {isSizeable && itemSizes && itemSizes.length > 0 && (
                    <div className="mb-5">
                      <Label className="mb-3 block">
                        {t('form:input-label-modifier-prices-by-size-quantity')}
                      </Label>
                      <div className="space-y-6">
                        {(() => {
                          if (relevantModifiers.length === 0) {
                            return (
                              <div className="p-4 text-center text-sm text-gray-500 border border-gray-200 rounded-lg">
                                {selectedModifierGroups.length === 0
                                  ? t('form:select-modifier-groups-first')
                                  : t('form:no-modifiers-found')}
                              </div>
                            );
                          }

                          return relevantModifiers.map(
                            (modifier: any, modifierIndex: number) => {
                              // Always use default quantity levels (Light, Normal, Extra) for all modifiers
                              const quantityLevelsToShow =
                                DEFAULT_QUANTITY_LEVELS;

                              return (
                                <div
                                  key={modifier.id || modifierIndex}
                                  className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h4 className="text-sm font-semibold text-heading">
                                      {modifier.name}
                                    </h4>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-semibold text-heading border-b border-gray-200">
                                            {t(
                                              'form:input-label-quantity-level',
                                            )}
                                          </th>
                                          {itemSizes.map(
                                            (size: any, sizeIndex: number) => (
                                              <th
                                                key={sizeIndex}
                                                className="px-4 py-2 text-center text-xs font-semibold text-heading border-b border-gray-200"
                                              >
                                                {size.name ||
                                                  size.code ||
                                                  `Size ${sizeIndex + 1}`}
                                              </th>
                                            ),
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* Always show default quantity levels (Light, Normal, Extra) */}
                                        {quantityLevelsToShow.map(
                                          (qtyLevel: any, qtyIndex: number) => (
                                            <tr
                                              key={qtyIndex}
                                              className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                              <td className="px-4 py-3 text-sm text-heading font-medium">
                                                {t(
                                                  `form:quantity-level-${qtyLevel.name.toLowerCase()}`,
                                                )}{' '}
                                                (
                                                {t('form:input-label-quantity')}
                                                : {qtyLevel.quantity})
                                              </td>
                                              {itemSizes.map(
                                                (
                                                  size: any,
                                                  sizeIndex: number,
                                                ) => (
                                                  <td
                                                    key={sizeIndex}
                                                    className="px-4 py-3"
                                                  >
                                                    <Input
                                                      {...register(
                                                        `modifier_assignment.modifier_prices_by_size_and_quantity.${modifier.id}.${size.code || size.name}.${qtyLevel.quantity}` as any,
                                                        {
                                                          valueAsNumber: true,
                                                        },
                                                      )}
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      placeholder="0.00"
                                                      className="w-full text-center"
                                                      variant="outline"
                                                    />
                                                  </td>
                                                ),
                                              )}
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            },
                          );
                        })()}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {t('form:modifier-prices-by-size-quantity-help')}
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel id="settings">
              <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                <Description
                  title={t('form:form-settings-title')}
                  details={t('form:item-description-help-text')}
                  className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                />
                <Card className="w-full sm:w-8/12 md:w-2/3">
                  <div className="mb-5">
                    <SwitchInput
                      name="is_active"
                      control={control}
                      label={t('form:input-label-active')}
                    />
                  </div>
                  <div className="mb-5">
                    <SwitchInput
                      name="is_available"
                      control={control}
                      label={t('form:input-label-available')}
                    />
                  </div>
                  <div className="mb-5">
                    <SwitchInput
                      name="is_signature"
                      control={control}
                      label={t('form:input-label-signature-dish')}
                    />
                  </div>
                  <div className="mb-5">
                    <SwitchInput
                      name="is_customizable"
                      control={control}
                      label={t('form:input-label-customizable')}
                    />
                  </div>
                </Card>
              </div>
            </TabPanel>
          </Tabs>

          <StickyFooterPanel className="z-0">
            <div className="flex items-center justify-end">
              <Button
                variant="custom"
                onClick={() => router.back()}
                className="!px-0 text-sm !text-body me-4 hover:!text-accent focus:ring-0 md:text-base"
                type="button"
                size="medium"
              >
                <LongArrowPrev className="w-4 h-5 me-2" />
                {t('form:button-label-back')}
              </Button>
              <Button
                loading={updating || creating}
                disabled={updating || creating}
                size="medium"
                className="text-sm md:text-base"
              >
                {initialValues ? (
                  <>
                    <EditIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                    <span className="sm:hidden">
                      {t('form:button-label-update')}
                    </span>
                    <span className="hidden sm:block">
                      {t('form:button-label-update-item')}
                    </span>
                  </>
                ) : (
                  t('form:button-label-add-item')
                )}
              </Button>
            </div>
          </StickyFooterPanel>
        </form>
      </FormProvider>
    </>
  );
}
