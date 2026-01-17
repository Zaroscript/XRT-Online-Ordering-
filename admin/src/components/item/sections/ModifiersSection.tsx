import { Control, Controller, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Label from '@/components/ui/label';
import Input from '@/components/ui/input';
import SelectInput from '@/components/ui/select-input';
import { FormValues, DEFAULT_QUANTITY_LEVELS } from '../item-form-types';
import { getGroupId } from '../utils/item-form-utils';

interface ModifiersSectionProps {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
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

        {/* Modifier Prices by Size and Quantity Levels */}
        {isSizeable && itemSizes && itemSizes.length > 0 && (
          <div className="mb-5">
            <Label className="mb-3 block">
              {t('form:input-label-modifier-prices-by-size-quantity')}
            </Label>
            <div className="space-y-6">
              {relevantModifiers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 border border-gray-200 rounded-lg">
                  {selectedModifierGroups.length === 0
                    ? t('form:select-modifier-groups-first')
                    : t('form:no-modifiers-found')}
                </div>
              ) : (
                relevantModifiers.map(
                  (modifier: any, modifierIndex: number) => {
                    const quantityLevelsToShow = DEFAULT_QUANTITY_LEVELS;

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
                                  {t('form:input-label-quantity-level')}
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
                                      ({t('form:input-label-quantity')}:{' '}
                                      {qtyLevel.quantity})
                                    </td>
                                    {itemSizes.map(
                                      (size: any, sizeIndex: number) => (
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
                )
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {t('form:modifier-prices-by-size-quantity-help')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
