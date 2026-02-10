import {
  Control,
  Controller,
  UseFormRegister,
  useWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Label from '@/components/ui/label';
import Input from '@/components/ui/input';
import SelectInput from '@/components/ui/select-input';
import { FormValues, DEFAULT_QUANTITY_LEVELS } from '../item-form-types';
import { getGroupId } from '../utils/item-form-utils';
import { useMemo } from 'react';

interface ModifiersSectionProps {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues, any, any>;
  setValue: UseFormSetValue<FormValues>;
  modifierGroupsFiltered: any[];
  loadingModifierGroups: boolean;
  relevantModifiers: any[];
  loadingModifiers: boolean;
  selectedModifierGroups: any[];
  allModifiersList: any[];
  isSizeable?: boolean;
  itemSizes: any[] | undefined;
}

export default function ModifiersSection({
  register,
  control,
  setValue,
  modifierGroupsFiltered,
  loadingModifierGroups,
  relevantModifiers,
  loadingModifiers,
  selectedModifierGroups,
  allModifiersList,
  isSizeable,
  itemSizes,
}: ModifiersSectionProps) {
  const { t } = useTranslation();

  // Watch pricing mode for each group
  const pricingMode =
    useWatch({
      control,
      name: 'modifier_assignment.pricing_mode',
      defaultValue: {},
    }) || {};

  // Watch item sizes to determine active ones
  const configuredSizes =
    useWatch({
      control,
      name: 'sizes',
      defaultValue: [],
    }) || [];

  const activeItemSizes = useMemo(() => {
    if (!itemSizes || !isSizeable) return [];
    // Get enabled size IDs from the form configuration
    const enabledSizeIds = configuredSizes
      .filter((s: any) => s.is_active)
      .map((s: any) => s.size_id);
    return itemSizes.filter((size: any) => enabledSizeIds.includes(size.id));
  }, [itemSizes, configuredSizes, isSizeable]);

  // Get modifiers grouped by their modifier group
  const modifiersByGroup = useMemo(() => {
    const grouped: { [groupId: string]: any[] } = {};
    selectedModifierGroups.forEach((group) => {
      const groupId = getGroupId(group);
      if (groupId) {
        grouped[groupId] = allModifiersList.filter((m) => {
          const mGroupId =
            typeof m.modifier_group_id === 'object'
              ? m.modifier_group_id?.id || m.modifier_group_id?._id
              : m.modifier_group_id;
          return String(mGroupId) === String(groupId);
        });
      }
    });
    return grouped;
  }, [selectedModifierGroups, allModifiersList]);

  // Helper to find price by size in an array - handles legacy data formats
  const findPriceBySize = (
    pricesArray: any[],
    sizeCode: string,
    sizeId?: string,
  ) => {
    if (!pricesArray || !Array.isArray(pricesArray)) return undefined;

    // Try matching by sizeCode first
    let match = pricesArray.find((pbs: any) => pbs.sizeCode === sizeCode);
    if (match?.priceDelta !== undefined) return match.priceDelta;

    // Try matching by size_id (legacy ObjectId format - match as string)
    if (sizeId) {
      match = pricesArray.find(
        (pbs: any) =>
          pbs.size_id?.toString() === sizeId || pbs.size_id === sizeId,
      );
      if (match?.priceDelta !== undefined) return match.priceDelta;
    }

    // Try matching by sizeName or name
    match = pricesArray.find(
      (pbs: any) => pbs.sizeName === sizeCode || pbs.name === sizeCode,
    );
    if (match?.priceDelta !== undefined) return match.priceDelta;

    // Try matching by index-based approach (first = Small, second = Medium, etc.)
    // This handles cases where sizes are stored by array position
    const sizeOrder = [
      'S',
      'M',
      'L',
      'XL',
      'XXL',
      'Small',
      'Medium',
      'Large',
      'Extra Large',
    ];
    const sizeIndex = sizeOrder.findIndex(
      (s) => s.toLowerCase() === sizeCode.toLowerCase(),
    );
    if (sizeIndex >= 0 && pricesArray[sizeIndex]?.priceDelta !== undefined) {
      return pricesArray[sizeIndex].priceDelta;
    }

    return undefined;
  };

  const getInheritedPrice = (
    modifier: any,
    group: any,
    sizeCode: string,
    quantity: number,
    sizeId?: string,
  ) => {
    // 1. Check Modifier Level - quantity_levels with prices_by_size
    if (modifier.quantity_levels && modifier.quantity_levels.length > 0) {
      const modQtyLevel = modifier.quantity_levels.find(
        (ql: any) => ql.quantity === quantity,
      );
      if (
        modQtyLevel?.prices_by_size &&
        modQtyLevel.prices_by_size.length > 0
      ) {
        const modPrice = findPriceBySize(
          modQtyLevel.prices_by_size,
          sizeCode,
          sizeId,
        );
        if (modPrice !== undefined) return modPrice;
      }
      // Check for base price in quantity level
      if (modQtyLevel?.price !== undefined) return modQtyLevel.price;
    }

    // 2. Check Modifier Level - direct prices_by_size (no quantity levels)
    if (modifier.prices_by_size && modifier.prices_by_size.length > 0) {
      const directPrice = findPriceBySize(
        modifier.prices_by_size,
        sizeCode,
        sizeId,
      );
      if (directPrice !== undefined) return directPrice;
    }

    // 3. Check Group Level - quantity_levels with prices_by_size
    if (group.quantity_levels && group.quantity_levels.length > 0) {
      const groupQtyLevel = group.quantity_levels.find(
        (ql: any) => ql.quantity === quantity,
      );
      if (
        groupQtyLevel?.prices_by_size &&
        groupQtyLevel.prices_by_size.length > 0
      ) {
        const groupPrice = findPriceBySize(
          groupQtyLevel.prices_by_size,
          sizeCode,
          sizeId,
        );
        if (groupPrice !== undefined) return groupPrice;
      }
      // Check for base price in quantity level
      if (groupQtyLevel?.price !== undefined) return groupQtyLevel.price;
    }

    // 4. Check Group Level - direct prices_by_size (no quantity levels)
    if (group.prices_by_size && group.prices_by_size.length > 0) {
      const groupDirectPrice = findPriceBySize(
        group.prices_by_size,
        sizeCode,
        sizeId,
      );
      if (groupDirectPrice !== undefined) return groupDirectPrice;
    }

    return 0;
  };

  return (
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
            placeholder={t('form:input-placeholder-select-modifier-groups')}
          />
        </div>

        {/* Per-group pricing mode toggles */}
        {selectedModifierGroups.length > 0 && (
          <div className="mb-5 space-y-4">
            <Label className="text-base font-semibold">
              {t('form:input-label-pricing-configuration')}
            </Label>
            {selectedModifierGroups.map((group: any) => {
              const groupId = getGroupId(group);
              if (!groupId) return null;

              // Look up full group data from modifierGroupsFiltered to get pricing info
              const fullGroupData =
                modifierGroupsFiltered?.find(
                  (g: any) => g.id === groupId || g._id === groupId,
                ) || group;

              const isOverride = pricingMode[groupId] === 'override';
              const groupModifiers = modifiersByGroup[groupId] || [];

              return (
                <div
                  key={groupId}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-heading">
                        {group.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {groupModifiers.length} {t('form:modifiers-count')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs ${!isOverride ? 'text-accent font-medium' : 'text-gray-500'}`}
                      >
                        {t('form:pricing-mode-inherit')}
                      </span>
                      <Controller
                        name={
                          `modifier_assignment.pricing_mode.${groupId}` as any
                        }
                        control={control}
                        defaultValue="inherit"
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => {
                              const newMode =
                                field.value === 'override'
                                  ? 'inherit'
                                  : 'override';
                              field.onChange(newMode);

                              // Populate defaults if switching to override
                              if (newMode === 'override') {
                                groupModifiers.forEach((modifier: any) => {
                                  if (
                                    isSizeable &&
                                    activeItemSizes &&
                                    activeItemSizes.length > 0
                                  ) {
                                    activeItemSizes.forEach((size: any) => {
                                      DEFAULT_QUANTITY_LEVELS.forEach((qty) => {
                                        const price = getInheritedPrice(
                                          modifier,
                                          fullGroupData,
                                          size.code || size.name,
                                          qty.quantity,
                                          size.id,
                                        );
                                        setValue(
                                          `modifier_assignment.modifier_prices_by_size_and_quantity.${modifier.id}.${size.code || size.name}.${qty.quantity}` as any,
                                          price,
                                        );
                                      });
                                    });
                                  } else {
                                    // Non-sizeable population
                                    DEFAULT_QUANTITY_LEVELS.forEach((qty) => {
                                      // Get modifier quantity level price or fallbacks
                                      const modQtyLevel =
                                        modifier.quantity_levels?.find(
                                          (ql: any) =>
                                            ql.quantity === qty.quantity,
                                        ) ||
                                        // Fallback to qty 1 if specific qty missing
                                        modifier.quantity_levels?.find(
                                          (ql: any) => ql.quantity === 1,
                                        ) ||
                                        modifier.quantity_levels?.[0];

                                      const groupQtyLevel =
                                        fullGroupData.quantity_levels?.find(
                                          (ql: any) =>
                                            ql.quantity === qty.quantity,
                                        ) ||
                                        // Fallback to qty 1
                                        fullGroupData.quantity_levels?.find(
                                          (ql: any) => ql.quantity === 1,
                                        ) ||
                                        fullGroupData.quantity_levels?.[0];

                                      const modPrice =
                                        modQtyLevel?.price ??
                                        groupQtyLevel?.price ??
                                        modifier.prices_by_size?.[0]
                                          ?.priceDelta ??
                                        fullGroupData.prices_by_size?.[0]
                                          ?.priceDelta ??
                                        0;

                                      setValue(
                                        `modifier_assignment.modifier_prices_by_quantity.${modifier.id}.${qty.quantity}` as any,
                                        modPrice,
                                      );
                                    });
                                  }
                                });
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isOverride ? 'bg-accent' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isOverride ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                      />
                      <span
                        className={`text-xs ${isOverride ? 'text-accent font-medium' : 'text-gray-500'}`}
                      >
                        {t('form:pricing-mode-override')}
                      </span>
                    </div>
                  </div>

                  {isOverride ? (
                    <div className="p-4">
                      {groupModifiers.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          {t('form:no-modifiers-in-group')}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {isSizeable &&
                          activeItemSizes &&
                          activeItemSizes.length > 0
                            ? // Show pricing table by size and quantity
                              groupModifiers.map((modifier: any) => (
                                <div
                                  key={modifier.id}
                                  className="border border-gray-100 rounded-lg overflow-hidden"
                                >
                                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium">
                                      {modifier.name}
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            {t(
                                              'form:input-label-quantity-level',
                                            )}
                                          </th>
                                          {activeItemSizes.map((size: any) => (
                                            <th
                                              key={size.code || size.name}
                                              className="px-3 py-2 text-center text-xs font-medium text-gray-500"
                                            >
                                              {size.name || size.code}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {DEFAULT_QUANTITY_LEVELS.map(
                                          (qtyLevel) => (
                                            <tr
                                              key={qtyLevel.quantity}
                                              className="border-t border-gray-100"
                                            >
                                              <td className="px-3 py-2 font-medium text-gray-700">
                                                {t(
                                                  `form:quantity-level-${qtyLevel.name.toLowerCase()}`,
                                                )}{' '}
                                                ({qtyLevel.quantity})
                                              </td>
                                              {activeItemSizes.map(
                                                (size: any) => (
                                                  <td
                                                    key={size.code || size.name}
                                                    className="px-3 py-2"
                                                  >
                                                    <Input
                                                      {...register(
                                                        `modifier_assignment.modifier_prices_by_size_and_quantity.${modifier.id}.${size.code || size.name}.${qtyLevel.quantity}` as any,
                                                        { valueAsNumber: true },
                                                      )}
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      placeholder="0.00"
                                                      className="w-20 text-center text-sm"
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
                              ))
                            : // Non-sizeable or no active sizes
                              groupModifiers.map((modifier: any) => (
                                <div
                                  key={modifier.id}
                                  className="border border-gray-100 rounded-lg overflow-hidden"
                                >
                                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium">
                                      {modifier.name}
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-1/2">
                                            {t(
                                              'form:input-label-quantity-level',
                                            )}
                                          </th>
                                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-1/2">
                                            {t('form:input-label-price')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {DEFAULT_QUANTITY_LEVELS.map(
                                          (qtyLevel) => (
                                            <tr
                                              key={qtyLevel.quantity}
                                              className="border-t border-gray-100"
                                            >
                                              <td className="px-3 py-2 font-medium text-gray-700">
                                                {t(
                                                  `form:quantity-level-${qtyLevel.name.toLowerCase()}`,
                                                )}{' '}
                                                ({qtyLevel.quantity})
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                <Input
                                                  {...register(
                                                    `modifier_assignment.modifier_prices_by_quantity.${modifier.id}.${qtyLevel.quantity}` as any,
                                                    { valueAsNumber: true },
                                                  )}
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  placeholder="0.00"
                                                  className="w-24 text-center text-sm mx-auto"
                                                  variant="outline"
                                                />
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="mb-2 text-sm text-blue-600 font-medium">
                        {t('form:pricing-inherited-from-modifier')}
                      </div>
                      {groupModifiers.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          {t('form:no-modifiers-in-group')}
                        </p>
                      ) : isSizeable &&
                        activeItemSizes &&
                        activeItemSizes.length > 0 ? (
                        // Show inherited pricing table (read-only)
                        groupModifiers.map((modifier: any) => (
                          <div
                            key={modifier.id}
                            className="border border-gray-100 rounded-lg overflow-hidden mb-3"
                          >
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                              <span className="text-sm font-medium">
                                {modifier.name}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                      {t('form:input-label-quantity-level')}
                                    </th>
                                    {activeItemSizes.map((size: any) => (
                                      <th
                                        key={size.code || size.name}
                                        className="px-3 py-2 text-center text-xs font-medium text-gray-500"
                                      >
                                        {size.name || size.code}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {DEFAULT_QUANTITY_LEVELS.map((qtyLevel) => (
                                    <tr
                                      key={qtyLevel.quantity}
                                      className="border-t border-gray-100"
                                    >
                                      <td className="px-3 py-2 font-medium text-gray-700">
                                        {t(
                                          `form:quantity-level-${qtyLevel.name.toLowerCase()}`,
                                        )}{' '}
                                        ({qtyLevel.quantity})
                                      </td>
                                      {activeItemSizes.map((size: any) => {
                                        const inheritedPrice =
                                          getInheritedPrice(
                                            modifier,
                                            fullGroupData,
                                            size.code || size.name,
                                            qtyLevel.quantity,
                                            size.id,
                                          );
                                        return (
                                          <td
                                            key={size.code || size.name}
                                            className="px-3 py-2 text-center text-gray-600"
                                          >
                                            ${inheritedPrice.toFixed(2)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Non-sizeable: show inherited pricing table
                        groupModifiers.map((modifier: any) => (
                          <div
                            key={modifier.id}
                            className="border border-gray-100 rounded-lg overflow-hidden mb-3"
                          >
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                              <span className="text-sm font-medium">
                                {modifier.name}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-1/2">
                                      {t('form:input-label-quantity-level')}
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-1/2">
                                      {t('form:price')}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {DEFAULT_QUANTITY_LEVELS.map((qtyLevel) => {
                                    // Calculate inherited price for this quantity level
                                    const defaultQtyLevel =
                                      modifier.quantity_levels?.find(
                                        (ql: any) =>
                                          ql.quantity === qtyLevel.quantity,
                                      ) ||
                                      modifier.quantity_levels?.find(
                                        (ql: any) => ql.quantity === 1,
                                      ) ||
                                      modifier.quantity_levels?.[0];

                                    const groupDefaultQtyLevel =
                                      fullGroupData.quantity_levels?.find(
                                        (ql: any) =>
                                          ql.quantity === qtyLevel.quantity,
                                      ) ||
                                      fullGroupData.quantity_levels?.find(
                                        (ql: any) => ql.quantity === 1,
                                      ) ||
                                      fullGroupData.quantity_levels?.[0];

                                    const modPrice =
                                      defaultQtyLevel?.price ??
                                      groupDefaultQtyLevel?.price ??
                                      modifier.prices_by_size?.[0]
                                        ?.priceDelta ??
                                      fullGroupData.prices_by_size?.[0]
                                        ?.priceDelta ??
                                      0;

                                    return (
                                      <tr
                                        key={qtyLevel.quantity}
                                        className="border-t border-gray-100"
                                      >
                                        <td className="px-3 py-2 font-medium text-gray-700">
                                          {t(
                                            `form:quantity-level-${qtyLevel.name.toLowerCase()}`,
                                          )}{' '}
                                          ({qtyLevel.quantity})
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-600">
                                          ${modPrice.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Controller
          name="modifier_assignment.default_modifiers"
          control={control}
          render={({ field }) => {
            return (
              <div className="mb-5">
                <Label>{t('form:input-label-default-modifiers')}</Label>
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
                      : t('form:input-placeholder-select-default-modifiers')
                  }
                  isDisabled={
                    selectedModifierGroups.length === 0 || loadingModifiers
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
      </Card>
    </div>
  );
}
