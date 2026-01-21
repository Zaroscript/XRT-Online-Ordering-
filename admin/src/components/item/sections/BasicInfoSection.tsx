import {
  Control,
  FieldErrors,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import { FormValues } from '../item-form-types';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUp } from '@/components/icons/chevron-up';

interface BasicInfoSectionProps {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues, any, any>;
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

        <div className="mb-5">
          <Label className="mb-3 block">
            {t('form:input-label-max-per-order')}
          </Label>
          <div className="mb-3">
            <SwitchInput
              name="is_max_per_order_unlimited"
              control={control}
              label={t('form:input-label-max-per-order-unlimited')}
            />
          </div>
          {!useWatch({ control, name: 'is_max_per_order_unlimited' }) && (
            <Input
              {...register('max_per_order')}
              type="number"
              min={1}
              error={t(errors.max_per_order?.message!)}
              variant="outline"
              placeholder={t('form:input-placeholder-max-per-order')}
            />
          )}
        </div>

        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium text-heading hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                <span>{t('form:form-settings-title')}</span>
                <ChevronUp
                  className={`${
                    !open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  <div className="mb-5">
                    <SwitchInput
                      name="is_sizeable"
                      control={control}
                      label={t('form:input-label-sizeable')}
                    />
                  </div>
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
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </Card>
    </div>
  );
}
