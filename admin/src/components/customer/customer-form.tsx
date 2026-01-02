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
import TextArea from '@/components/ui/text-area';
import { FormValues, CustomerFormProps } from './types';
import { defaultValues } from './constants';

const CustomerForm = ({ initialValues }: CustomerFormProps) => {
  const { t } = useTranslation(['form', 'common']);
  const router = useRouter();
  const { mutate: createCustomer, isLoading: creating } =
    useCreateCustomerMutation();
  const { mutate: updateCustomer, isLoading: updating } =
    useUpdateCustomerMutation();


  const isNew = !initialValues;
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
        name: initialValues.name,
        email: initialValues.email,
        phoneNumber: initialValues.phoneNumber,
        rewards: initialValues.rewards || 0,
        notes: initialValues.notes || '',
      }
      : defaultValues,
    resolver: yupResolver(
      isNew ? customerValidationSchema : customerUpdateValidationSchema,
    ),
  });

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
          title={t('form-title-information')}
          details={t('customer-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('input-label-name')}
            {...register('name')}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.name?.message!)}
            required
          />

          <Input
            label={t('input-label-email')}
            {...register('email')}
            type="email"
            variant="outline"
            className="mb-4"
            error={t(errors.email?.message!)}
            required
          />

          <Input
            label={t('input-label-phone')}
            {...register('phoneNumber')}
            type="tel"
            variant="outline"
            className="mb-4"
            error={t(errors.phoneNumber?.message!)}
            required
          />

          <Input
            label={t('input-label-rewards')}
            {...register('rewards', { valueAsNumber: true })}
            type="number"
            variant="outline"
            className="mb-4"
            error={t(errors.rewards?.message!)}
            min="0"
          />

          <div className="mb-4">
            <Label>{t('input-label-notes')}</Label>
            <TextArea
              {...register('notes')}
              variant="outline"
              className="mb-4"
              placeholder={t('placeholder-customer-notes')}
              rows={3}
            />
          </div>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="mb-4 text-end">
          <Button loading={isLoading} disabled={isLoading}>
            {initialValues
              ? t('button-label-update-customer')
              : t('button-label-create-customer')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default CustomerForm;
