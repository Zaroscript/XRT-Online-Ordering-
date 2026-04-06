import { useFieldArray, useWatch } from 'react-hook-form';
import SelectInput from '@/components/ui/select-input';
import DatePicker from '@/components/ui/date-picker';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { TrashIcon } from '@/components/icons/trash';
import { useTranslation } from 'next-i18next';
import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useEmailAudienceCountMutation } from '@/data/emails';
import { useSmsAudienceCountMutation } from '@/data/sms';

export const getAudienceGroups = (t: any) => [
  {
    label: t('common:audience-group-customer-activity'),
    options: [
      { label: t('common:audience-rule-ordered-after-date'), value: 'ordered_after_date', inputType: 'date' },
      { label: t('common:audience-rule-ordered-before-date'), value: 'ordered_before_date', inputType: 'date' },
      { label: t('common:audience-rule-never-ordered'), value: 'never_ordered', inputType: 'none' },
      { label: t('common:audience-rule-inactive-x-days'), value: 'inactive_x_days', inputType: 'number' },
      { label: t('common:audience-rule-active-x-days'), value: 'active_x_days', inputType: 'number' },
    ],
  },
  {
    label: t('common:audience-group-orders'),
    options: [
      { label: t('common:audience-rule-order-count-gt-x'), value: 'order_count_gt_x', inputType: 'number' },
      { label: t('common:audience-rule-order-count-lt-x'), value: 'order_count_lt_x', inputType: 'number' },
      { label: t('common:audience-rule-order-count-eq-x'), value: 'order_count_eq_x', inputType: 'number' },
      { label: t('common:audience-rule-at-least-1-order'), value: 'at_least_1_order', inputType: 'none' },
    ],
  },
  {
    label: t('common:audience-group-spending'),
    options: [
      { label: t('common:audience-rule-total-spent-gt-x'), value: 'total_spent_gt_x', inputType: 'currency' },
      { label: t('common:audience-rule-total-spent-lt-x'), value: 'total_spent_lt_x', inputType: 'currency' },
      { label: t('common:audience-rule-avg-order-gt-x'), value: 'avg_order_gt_x', inputType: 'currency' },
      { label: t('common:audience-rule-last-order-amount-gt-x'), value: 'last_order_amount_gt_x', inputType: 'currency' },
    ],
  },
  {
    label: t('common:audience-group-customer-type'),
    options: [
      { label: t('common:audience-rule-new-customers-x-days'), value: 'new_customers_x_days', inputType: 'number' },
      { label: t('common:audience-rule-returning-customers'), value: 'returning_customers', inputType: 'none' },
      { label: t('common:audience-rule-vip-spent-gt-x'), value: 'vip_spent_gt_x', inputType: 'currency' },
    ],
  },
  {
    label: t('common:audience-group-inactive-churn'),
    options: [
      { label: t('common:audience-rule-no-orders-x-days'), value: 'no_orders_x_days', inputType: 'number' },
      { label: t('common:audience-rule-last-order-before-date'), value: 'last_order_before_date', inputType: 'date' },
    ],
  },
];

interface AudienceFilterProps {
  control: any;
  register: any;
  errors: any;
  targetType?: 'email' | 'sms';
  countPayload?: Record<string, unknown>;
}

const FilterRow = ({ control, register, index, remove, errors }: any) => {
  const { t } = useTranslation();
  const groups = getAudienceGroups(t);
  
  // Watch the selected rule for this specific row
  const selectedRule = useWatch({
    control,
    name: `filters.${index}.rule`,
  });

  const ruleValue = selectedRule?.value;
  const selectedRuleInfo = groups
    .flatMap((g) => g.options)
    .find((o) => o.value === ruleValue);
                      
  const inputType = selectedRuleInfo?.inputType || 'none';
  const fieldError = errors?.filters?.[index];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-[#f8f9fa] border border-border-base rounded mb-4 shadow-sm">
      <div className="md:w-16 font-semibold text-gray-400 text-left md:text-right text-sm tracking-wider uppercase">
        {index === 0 ? t('common:where') : t('common:and')}
      </div>
      
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <SelectInput
          name={`filters.${index}.rule`}
          control={control}
          options={groups}
          getOptionLabel={(option: any) => option.label}
          getOptionValue={(option: any) => option.value}
          placeholder={t('common:text-select') + '...'}
        />

        <div className="w-full">
          {inputType === 'none' && (
            <div className="flex items-center text-sm text-gray-400 italic bg-white border border-dashed border-gray-200 rounded px-4 py-2 min-h-[46px]">
              {t('common:no-additional-input-required')}
            </div>
          )}
          
          {inputType === 'date' && (
            <DatePicker
              control={control}
              name={`filters.${index}.value`}
              dateFormat="dd/MM/yyyy"
              className="w-full"
              error={fieldError?.value?.message}
              placeholder={t('form:placeholder-date', 'Select Date')}
            />
          )}

          {inputType === 'number' && (
            <Input
              type="number"
              variant="outline"
              className="w-full bg-white"
              showLabel={false}
              {...register(`filters.${index}.value`)}
              placeholder="0"
              error={fieldError?.value?.message}
            />
          )}

          {inputType === 'currency' && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium z-10">$</span>
              <Input
                type="number"
                variant="outline"
                className="w-full"
                inputClassName="pl-8 bg-white"
                showLabel={false}
                {...register(`filters.${index}.value`)}
                placeholder="00.00"
                error={fieldError?.value?.message}
              />
            </div>
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => remove(index)}
        className="text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors p-3 rounded-full"
        title={t('common:text-delete')}
      >
        <TrashIcon width={18} />
      </button>
    </div>
  );
}

const AudienceFilter: React.FC<AudienceFilterProps> = ({
  control,
  register,
  errors,
  targetType,
  countPayload,
}) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'filters',
  });

  const filters = useWatch({ control, name: 'filters' });
  const [liveCount, setLiveCount] = useState<number | null>(null);

  const { mutate: countEmailOptions, isPending: countingEmail } = useEmailAudienceCountMutation();
  const { mutate: countSmsOptions, isPending: countingSms } = useSmsAudienceCountMutation();

  const isCounting = countingEmail || countingSms;
  const countPayloadKey = JSON.stringify(countPayload || {});

  const debouncedCount = useMemo(
    () =>
      debounce((currentFilters: any[]) => {
        if (!targetType) return;
        if (targetType === 'sms') {
          countSmsOptions({ filters: currentFilters, ...(countPayload || {}) }, {
            onSuccess: (res: any) => setLiveCount(res?.count ?? 0),
            onError: () => setLiveCount(0),
          });
        } else {
          countEmailOptions({ filters: currentFilters, ...(countPayload || {}) }, {
            onSuccess: (res: any) => setLiveCount(res?.count ?? 0),
            onError: () => setLiveCount(0),
          });
        }
      }, 500),
    [targetType, countEmailOptions, countSmsOptions, countPayloadKey]
  );

  useEffect(() => {
    // Only count if there are actual filters or if targetType is provided
    if (targetType) {
      debouncedCount(filters || []);
    }
    return () => debouncedCount.cancel();
  }, [filters, debouncedCount, targetType]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="block text-base font-semibold leading-none text-body-dark mb-1">
            {t('common:target-audience-filters')}
          </span>
          <p className="text-sm text-gray-500">{t('common:add-filters-description')}</p>
        </div>
        <Button
          type="button"
          onClick={() => append({ rule: null, value: '' })}
          variant="outline"
          size="small"
          className="bg-gray-50"
        >
          + {t('common:add-filter')}
        </Button>
      </div>

      <div className="bg-white p-5 border border-border-base rounded shadow-sm">
        {fields.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded text-gray-500 text-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <p className="font-medium text-gray-600 mb-1">{t('common:no-filters-applied')}</p>
            <p className="text-xs">{t('common:click-to-start-targeting')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((item, index) => (
               <FilterRow 
                 key={item.id} 
                 control={control} 
                 register={register} 
                 index={index} 
                 remove={remove} 
                 errors={errors} 
               />
            ))}
          </div>
        )}
      </div>

      {/* Live Audience Count Display */}
      {targetType && (
        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4 mt-6">
          <span className="text-sm font-medium text-gray-500">
            {t('common:estimated-audience-size', 'Estimated Audience Size')}
          </span>
          <span className="text-lg font-bold text-accent bg-accent/10 px-4 py-1.5 rounded-full min-w-[3rem] text-center shadow-sm">
            {isCounting ? (
              <span className="inline-block animate-pulse">...</span>
            ) : (
              (liveCount ?? 0).toLocaleString()
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudienceFilter;
