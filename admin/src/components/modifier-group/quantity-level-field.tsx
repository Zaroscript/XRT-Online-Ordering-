import Input from '@/components/ui/input';
import SwitchInput from '@/components/ui/switch-input';
import { Control, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { TrashIcon } from '@/components/icons/trash';
import { ArrowDown } from '@/components/icons/arrow-down';
import Label from '@/components/ui/label';
import cn from 'classnames';
import { useState } from 'react';
import Button from '@/components/ui/button';

interface Props {
  index: number;
  remove: () => void;
  control: Control<any>;
  errors: any;
  globalSizes?: any[];
}

export default function QuantityLevelField({
  index,
  remove,
  control,
  errors,
  globalSizes = [],
}: Props) {
  const { t } = useTranslation(['common', 'form']);
  const { register } = useFormContext();
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);

  // Check if there are any prices set to auto-expand or show indicator
  // const hasPrices = ... (can be calculated if needed, for now manual toggle is fine)

  return (
    <div
      className={cn(
        'w-full max-w-full overflow-x-hidden transition-colors',
        // Mobile/Tablet: Card style
        'p-4 border border-border-200 rounded-lg bg-gray-50 mb-4',
        // Desktop: Table row style
        'lg:p-4 lg:border-0 lg:bg-transparent lg:rounded-none lg:mb-0 lg:hover:bg-gray-50/50',
      )}
    >
      {/* Mobile/Tablet Header: Title + Delete */}
      <div className="flex items-center justify-between lg:hidden mb-4 border-b border-gray-200 pb-2">
        <span className="text-sm font-semibold text-heading">
          {t('form:text-level')} {index + 1}
        </span>
        <button
          type="button"
          onClick={() => remove()}
          className="text-red-500 hover:text-red-700 p-1.5 flex-shrink-0 transition-colors bg-white rounded-full border border-gray-200 shadow-sm"
          aria-label={t('common:text-delete')}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-4 lg:items-center">
        {/* Quantity */}
        <div className="lg:col-span-2">
          <Input
            label={t('form:input-label-quantity') || 'Quantity'}
            labelClassName="lg:sr-only"
            {...register(`quantity_levels.${index}.quantity` as const, {
              valueAsNumber: true,
            })}
            type="number"
            min="1"
            error={t(errors.quantity_levels?.[index]?.quantity?.message!)}
            variant="outline"
            className="w-full"
            inputClassName="bg-white"
          />
        </div>

        {/* Name */}
        <div className="lg:col-span-4">
          <Input
            label={t('form:input-label-name') || 'Name'}
            labelClassName="lg:sr-only"
            {...register(`quantity_levels.${index}.name` as const)}
            type="text"
            error={t(errors.quantity_levels?.[index]?.name?.message!)}
            variant="outline"
            placeholder={t('form:input-placeholder-quantity-level-name')}
            className="w-full"
            inputClassName="bg-white"
          />
        </div>

        {/* Display Order */}
        <div className="lg:col-span-2">
          <Input
            label={t('form:input-label-display-order') || 'Order'}
            labelClassName="lg:sr-only" // Hide label on desktop
            {...register(`quantity_levels.${index}.display_order` as const, {
              valueAsNumber: true,
            })}
            type="number"
            min="0"
            error={t(errors.quantity_levels?.[index]?.display_order?.message!)}
            variant="outline"
            className="w-full"
            inputClassName="bg-white"
          />
        </div>

        {/* Toggles */}
        <div className="lg:col-span-3 flex flex-row items-center gap-4 py-2 lg:py-0">
          <SwitchInput
            name={`quantity_levels.${index}.is_default`}
            control={control}
            label={t('form:input-label-default') || 'Default'}
            className="bg-white px-2 py-1 rounded-md border border-gray-100 lg:border-0 lg:bg-transparent lg:p-0"
          />
          <SwitchInput
            name={`quantity_levels.${index}.is_active`}
            control={control}
            label={t('form:input-label-active') || 'Active'}
            className="bg-white px-2 py-1 rounded-md border border-gray-100 lg:border-0 lg:bg-transparent lg:p-0"
          />
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden lg:flex lg:col-span-1 justify-end items-center gap-2">
          <button
            type="button"
            onClick={() => remove()}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
            title={t('common:text-delete')}
            aria-label={t('common:text-delete')}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nested Prices by Size */}
      <div className="mt-4 lg:mt-3 lg:pl-0">
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPriceExpanded(!isPriceExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('form:input-label-pricing-by-size') || 'Pricing by Size'}
              </span>
              <span className="text-xs text-gray-400 font-normal">
                ({globalSizes.length} sizes)
              </span>
            </div>
            <ArrowDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                { 'transform rotate-180': isPriceExpanded },
              )}
            />
          </button>

          {isPriceExpanded && (
            <div className="p-4 pb-6 border-t border-gray-100 animate-slide-down">
              {globalSizes.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 italic">
                  {t('form:no-global-sizes-available', {
                    defaultValue:
                      'No global sizes available. Configure sizes in settings/items.',
                  })}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">
                    Enter price difference (e.g. +2.00 or -1.00) for each size.
                    Leave empty for no change.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {globalSizes.map((size: any) => (
                      <SizePriceInput
                        key={size.id}
                        size={size}
                        control={control}
                        nestIndex={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component to manage individual size price input
function SizePriceInput({ size, nestIndex, control }: any) {
  const { getValues } = useFormContext();
  const pricesName = `quantity_levels.${nestIndex}.prices_by_size`;

  // We watch the entire array to find our entry
  const prices = useFieldArray({
    control,
    name: pricesName,
  });

  // Find index of this size in the array
  const fieldIndex = prices.fields.findIndex(
    (f: any) => (f as any).size_id === size.id,
  );
  const entry = fieldIndex >= 0 ? prices.fields[fieldIndex] : null;

  const handleBlur = (e: any) => {
    const val = e.target.value;
    const numVal = parseFloat(val);
    const currentFields = getValues(pricesName) || [];
    const idx = currentFields.findIndex(
      (f: any) => f.size_id === size.id || f.sizeCode === size.code,
    );

    if (val === '' || isNaN(numVal)) {
      if (idx >= 0) {
        prices.remove(idx);
      }
    } else {
      if (idx >= 0) {
        const currentPrice =
          currentFields[idx].priceDelta || currentFields[idx].price;
        if (currentPrice !== numVal) {
          prices.update(idx, { size_id: size.id, priceDelta: numVal });
        }
      } else {
        prices.append({ size_id: size.id, priceDelta: numVal });
      }
    }
  };

  const entryPrice = entry
    ? (entry as any).priceDelta !== undefined
      ? (entry as any).priceDelta
      : (entry as any).price
    : '';

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded border border-gray-100 bg-gray-50/50">
      <Label className="text-xs mb-0 font-medium text-gray-600">
        {size.name} ({size.code})
      </Label>
      <Input
        name={`size-price-${size.id}`} // Dummy name to satisfy prop requirement
        type="number"
        step="0.01"
        placeholder="0.00"
        className="!h-9 !text-sm"
        inputClassName="bg-white"
        defaultValue={entryPrice}
        onBlur={handleBlur}
      />
    </div>
  );
}
