import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import {
  useBulkPriceUpdateMutation,
  PriceChangeType,
  PriceValueType,
  BulkPriceUpdateInput,
  PriceUpdateTarget,
} from '@/data/price-update';
import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';

type FormValues = {
  type: { label: string; value: string };
  value_type: { label: string; value: string };
  value: number;
  target: { label: string; value: string };
};

export default function BulkPriceUpdateForm() {
  const { t } = useTranslation();
  const { mutate: updatePrices, isPending: isLoading } =
    useBulkPriceUpdateMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const changeTypeOptions = [
    { label: t('form:input-label-increase'), value: PriceChangeType.INCREASE },
    { label: t('form:input-label-decrease'), value: PriceChangeType.DECREASE },
  ];

  const valueTypeOptions = [
    {
      label: t('form:input-label-percentage'),
      value: PriceValueType.PERCENTAGE,
    },
    { label: t('form:input-label-fixed-amount'), value: PriceValueType.FIXED },
  ];

  const targetOptions = [
    { label: t('form:input-label-items'), value: PriceUpdateTarget.ITEMS },
    {
      label: t('form:input-label-modifiers'),
      value: PriceUpdateTarget.MODIFIERS,
    },
  ];

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: changeTypeOptions[0],
      value_type: valueTypeOptions[0],
      value: 0,
      target: targetOptions[0],
    },
  });

  // Watch values for confirmation message
  const watchedValues = watch();

  const onSubmit = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    const values = getValues();
    const input: BulkPriceUpdateInput = {
      type: values.type.value as PriceChangeType,
      value_type: values.value_type.value as PriceValueType,
      value: Number(values.value),
      target: values.target.value as PriceUpdateTarget,
    };

    updatePrices(input, {
      onSuccess: () => {
        setIsConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap my-5 sm:my-8">
          <Description
            title={t('form:form-title-bulk-price-update')}
            details={t('form:form-description-bulk-price-update')}
            className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:pb-0"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div className="grid grid-cols-1 gap-5 mb-5">
              <div>
                <Label>{t('form:input-label-target')}</Label>
                <SelectInput
                  name="target"
                  control={control}
                  options={targetOptions}
                />
              </div>
              <div>
                <Label>{t('form:input-label-operation-type')}</Label>
                <SelectInput
                  name="type"
                  control={control}
                  options={changeTypeOptions}
                />
              </div>

              <div>
                <Label>{t('form:input-label-value-type')}</Label>
                <SelectInput
                  name="value_type"
                  control={control}
                  options={valueTypeOptions}
                />
              </div>

              <Input
                label={t('form:input-label-value')}
                {...register('value', {
                  required: 'Value is required',
                  min: 0,
                })}
                type="number"
                step="0.01"
                error={t(errors.value?.message!)}
                note={t('form:input-note-price-update-value')}
              />
            </div>

            <div className="text-end">
              <Button loading={isLoading} disabled={isLoading}>
                {t('form:button-label-update-prices')}
              </Button>
            </div>
          </Card>
        </div>
      </form>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-red-600">
              {t('common:warning-irreversible-action')}
            </h3>
            <p className="mb-4">
              {t('common:bulk-price-update-confirmation-message', {
                target: watchedValues.target?.label,
                operation: watchedValues.type?.label,
                value: watchedValues.value,
                type: watchedValues.value_type?.label,
              })}
            </p>
            <p className="text-sm text-gray-500 mb-6 italic">
              {t('common:bulk-price-update-rollback-note')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isLoading}
              >
                {t('form:button-label-cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                loading={isLoading}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('form:button-label-confirm-update')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
