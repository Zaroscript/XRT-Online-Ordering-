import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  customerValidationSchema,
  customerUpdateValidationSchema,
} from './customer-validation-schema';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/data/customer';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useShopsQuery } from '@/data/shop';
import { useLocationsQuery } from '@/data/location';
import Select from '@/components/ui/select/select';
import { Controller } from 'react-hook-form';
import TextArea from '@/components/ui/text-area';
import { FormValues, CustomerFormProps } from './types';
import { defaultValues } from './constants';

const CustomerForm = ({ initialValues }: CustomerFormProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: createCustomer, isLoading: creating } =
    useCreateCustomerMutation();
  const { mutate: updateCustomer, isLoading: updating } =
    useUpdateCustomerMutation();

  const { shops: businesses, loading: loadingBusinesses } = useShopsQuery(
    { limit: 100 },
  );
  const { data: locations, isLoading: loadingLocations } = useLocationsQuery({
    limit: 100,
  });

  const isNew = !initialValues;
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    setError,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
        name: initialValues.name,
        email: initialValues.email,
        phoneNumber: initialValues.phoneNumber,
        business_id:
          initialValues.business_id?._id || initialValues.business_id,
        location_id:
          initialValues.location_id?._id || initialValues.location_id,
        rewards: initialValues.rewards || 0,
        notes: initialValues.notes || '',
      }
      : defaultValues,
    resolver: yupResolver(
      isNew ? customerValidationSchema : customerUpdateValidationSchema,
    ),
  });

  const selectedBusinessId = watch('business_id');

  // Filter locations by selected business
  const businessLocations =
    locations?.filter(
      (location: any) =>
        location.business_id?._id === selectedBusinessId ||
        location.business_id === selectedBusinessId,
    ) || [];

  const businessOptions =
    businesses?.map((business: any) => ({
      label: business.name,
      value: business._id,
    })) || [];

  const locationOptions =
    businessLocations.map((location: any) => ({
      label: location.name,
      value: location._id,
    })) || [];

  async function onSubmit(values: any) {
    const input = {
      ...values,
      rewards: Number(values.rewards) || 0,
    };

    if (isNew) {
      createCustomer(input, {
        onError: (error: any) => {
          if (error?.response?.data) {
            Object.keys(error.response.data).forEach((field: any) => {
              setError(field, {
                type: 'manual',
                message: error.response.data[field],
              });
            });
          }
        },
        onSuccess: () => {
          router.push(Routes.customer.list);
        },
      });
    } else {
      updateCustomer(
        {
          id: initialValues?._id,
          variables: input,
        },
        {
          onError: (error: any) => {
            if (error?.response?.data) {
              Object.keys(error.response.data).forEach((field: any) => {
                setError(field, {
                  type: 'manual',
                  message: error.response.data[field],
                });
              });
            }
          },
          onSuccess: () => {
            router.push(Routes.customer.list);
          },
        },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:customer-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.name?.message!)}
            required
          />

          <Input
            label={t('form:input-label-email')}
            {...register('email')}
            type="email"
            variant="outline"
            className="mb-4"
            error={t(errors.email?.message!)}
            required
          />

          <Input
            label={t('form:input-label-phone')}
            {...register('phoneNumber')}
            type="tel"
            variant="outline"
            className="mb-4"
            error={t(errors.phoneNumber?.message!)}
            required
          />

          <div className="mb-4">
            <Label>{t('form:input-label-business')}</Label>
            <Controller
              name="business_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isLoading={loadingBusinesses}
                  options={businessOptions}
                  isClearable={false}
                  value={businessOptions.find(
                    (option: any) => option.value === field.value,
                  )}
                  onChange={(selected: any) => {
                    field.onChange(selected?.value);
                    // Reset location when business changes
                    setValue('location_id', '');
                  }}
                />
              )}
            />
            {errors.business_id && (
              <p className="mt-1 text-sm text-red-500">
                {t(errors.business_id.message!)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <Label>{t('form:input-label-location')}</Label>
            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isLoading={loadingLocations}
                  options={locationOptions}
                  isClearable={false}
                  isDisabled={!selectedBusinessId}
                  value={locationOptions.find(
                    (option: any) => option.value === field.value,
                  )}
                  placeholder={
                    selectedBusinessId
                      ? t('form:placeholder-select-location')
                      : t('form:placeholder-select-business-first')
                  }
                  onChange={(selected: any) => {
                    field.onChange(selected?.value);
                  }}
                />
              )}
            />
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-500">
                {t(errors.location_id.message!)}
              </p>
            )}
          </div>

          <Input
            label={t('form:input-label-rewards')}
            {...register('rewards', { valueAsNumber: true })}
            type="number"
            variant="outline"
            className="mb-4"
            error={t(errors.rewards?.message!)}
            min="0"
          />

          <div className="mb-4">
            <Label>{t('form:input-label-notes')}</Label>
            <TextArea
              {...register('notes')}
              variant="outline"
              className="mb-4"
              placeholder={t('form:placeholder-customer-notes')}
              rows={3}
            />
          </div>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="mb-4 text-end">
          <Button loading={isLoading} disabled={isLoading}>
            {initialValues
              ? t('form:button-label-update-customer')
              : t('form:button-label-create-customer')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default CustomerForm;
