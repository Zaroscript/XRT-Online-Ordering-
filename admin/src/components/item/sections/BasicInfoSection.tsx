import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import { FormValues } from '../item-form-types';

interface BasicInfoSectionProps {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  categories: any[];
  loadingCategories: boolean;
  isSizeable?: boolean;
  isEditing: boolean;
}

export default function BasicInfoSection({
  register,
  control,
  errors,
  categories,
  loadingCategories,
  isSizeable,
  isEditing,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={t('form:item-description')}
        details={`${
          isEditing
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
  );
}
