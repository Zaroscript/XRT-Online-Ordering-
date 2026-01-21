import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Alert from '@/components/ui/alert';
import ItemSizesManager from '../item-sizes-manager';
import { FormValues } from '../item-form-types';

interface SizesSectionProps {
  control: Control<FormValues, any, any>;
  errors: FieldErrors<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  isSizeable?: boolean;
  shopId: string;
  itemId?: string;
  defaultSizeId: string | null | undefined;
}

export default function SizesSection({
  control,
  errors,
  setValue,
  isSizeable,
  shopId,
  itemId,
  defaultSizeId,
}: SizesSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={t('form:input-label-sizes')}
        details={t('form:item-sizes-help-text')}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />
      <Card className="w-full sm:w-8/12 md:w-2/3">
        {!isSizeable ? (
          <Alert message={t('form:enable-sizeable-first')} variant="info" />
        ) : (
          <>
            {itemId || shopId ? (
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
                        const newSizes = currentSizes.map((s: any) => ({
                          ...s,
                          is_default: s.size_id === sizeId,
                        }));
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
  );
}
