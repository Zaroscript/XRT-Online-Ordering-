import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';
import { UserRoleEnum } from '@/types';
import { useRegisterMutation } from '@/data/user';

type FormValues = {
  name: string;
  email: string;
  password: string;
  permission: UserRoleEnum;
};
const registrationFormSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
  permission: yup.string().default('client').oneOf(['client']),
});
const RegistrationForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: registerUser, isPending: loading } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(registrationFormSchema),
    defaultValues: {
      permission: UserRoleEnum.StoreOwner,
    },
  });
  const router = useRouter();
  const { t } = useTranslation();

  async function onSubmit({ name, email, password, permission }: FormValues) {
    registerUser(
      {
        name,
        email,
        password,
        role: 'admin', // Map store_owner to admin for customize_server
      },

      {
        onSuccess: (data: any) => {
          // Registration is disabled, this should not be reached
          setErrorMessage(t('errors:registration-disabled'));
        },
        onError: (error: any) => {
          // Show the registration disabled error message
          setErrorMessage(error?.message || t('errors:registration-disabled'));
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      {errorMessage && (
        <Alert
          message={errorMessage}
          variant="error"
          closeable={true}
          className="mb-4"
          onClose={() => setErrorMessage(null)}
        />
      )}
      <form
        onSubmit={handleSubmit(
          //@ts-ignore
          onSubmit,
        )}
        noValidate
        className="space-y-4"
      >
        <Input
          label={t('form:input-label-name')}
          {...register('name')}
          variant="outline"
          placeholder={t('form:input-placeholder-full-name')}
          error={t(errors?.name?.message!)}
          className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
        />
        <Input
          label={t('form:input-label-email')}
          {...register('email')}
          type="email"
          variant="outline"
          placeholder={t('form:input-placeholder-email-address')}
          error={t(errors?.email?.message!)}
          className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
        />
        <PasswordInput
          label={t('form:input-label-password')}
          {...register('password')}
          error={t(errors?.password?.message!)}
          variant="outline"
          placeholder={t('form:input-placeholder-create-password')}
          className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
        />
        <Button
          className="mt-6 h-11 w-full text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          loading={loading}
          disabled={loading}
        >
          {t('form:button-label-create-account')}
        </Button>
      </form>
      <div className="relative flex flex-col items-center justify-center pt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative bg-white px-4 text-sm text-gray-500">
          {t('common:text-or')}
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 sm:text-base">
        {t('form:text-already-account')}{' '}
        <Link
          href={Routes.login}
          className="font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 rounded"
        >
          {t('form:button-label-login')}
        </Link>
      </div>
    </div>
  );
};

export default RegistrationForm;
