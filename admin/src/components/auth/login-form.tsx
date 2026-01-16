import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import Form from '@/components/ui/forms/form';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import Router from 'next/router';
import { toast } from 'react-toastify';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
});

const defaultValues = {
  email: 'admin@demo.com',
  password: 'demodemo',
};

const LoginForm = () => {
  const { t } = useTranslation();
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: login, isPending: isLoading } = useLogin();

  // Load saved email on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('remember_email');
      if (savedEmail) {
        defaultValues.email = savedEmail;
        setRememberMe(true);
      }
    }
  });

  function onSubmit(values: LoginInput, e?: React.BaseSyntheticEvent) {
    // Prevent any default form submission behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any previous error messages
    setErrorMessage(null);

    // Handle Remember Me
    if (rememberMe) {
      localStorage.setItem('remember_email', values.email);
    } else {
      localStorage.removeItem('remember_email');
    }

    login(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (data: any) => {
          // Handle customize_server response format: { success: true, message: '...', data: { user, accessToken, refreshToken } }
          const responseData = data?.data || data;
          const token = responseData?.accessToken;
          const refreshToken = responseData?.refreshToken;
          const user = responseData?.user;

          if (token && refreshToken && user) {
            const permissions = user.permissions || [];
            const role = user.role || '';

            // Check if role is allowed
            if (
              role === 'super_admin' ||
              role === 'admin' ||
              role === 'client'
            ) {
              setAuthCredentials(
                token,
                permissions,
                role,
                refreshToken,
                rememberMe,
              );
              Router.push(Routes.dashboard);
              return;
            }
            const errorMsg = t('form:error-enough-permission');
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          } else {
            // Handle case where response format is unexpected
            console.error('Unexpected login response format:', data);
            const errorMsg = t('form:error-credential-wrong');
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          }
        },
        onError: (error: any) => {
          console.error('Login error details:', {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            code: error?.code,
          });

          let errorMsg = t('common:login-failed');

          // Handle network errors and timeouts
          if (
            error?.code === 'ERR_NETWORK' ||
            error?.message?.includes('Network Error')
          ) {
            errorMsg = t('errors:network-error');
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
            return;
          }

          // Handle timeout errors
          if (
            error?.code === 'ECONNABORTED' ||
            error?.message?.includes('timeout')
          ) {
            errorMsg = t('errors:timeout-error');
            setErrorMessage(errorMsg);
            toast.error(t('errors:request-timeout-toast'));
            return;
          }

          // Handle different HTTP error types
          if (error?.response?.status === 401) {
            errorMsg =
              error?.response?.data?.message ||
              t('form:error-credential-wrong');
          } else if (error?.response?.status === 403) {
            errorMsg =
              error?.response?.data?.message ||
              t('form:error-enough-permission');
          } else if (error?.response?.status === 429) {
            errorMsg = t('form:error-too-many-attempts');
          } else if (error?.response?.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error?.message) {
            errorMsg = error.message;
          }

          setErrorMessage(errorMsg);
          toast.error(errorMsg);
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
      <Form<LoginInput>
        validationSchema={loginFormSchema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-4">
            <Input
              label={t('form:input-label-email')}
              {...register('email')}
              type="email"
              variant="outline"
              error={t(errors?.email?.message!)}
              placeholder={t('form:input-placeholder-email')}
              className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              placeholder={t('form:input-placeholder-password')}
              forgotPageLink={Routes.forgotPassword}
              className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-body"
                >
                  {t('form:input-label-remember-me')}
                </label>
              </div>
            </div>
            <Button
              className="w-full mt-6 h-11 text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md"
              loading={isLoading}
              disabled={isLoading}
            >
              {t('form:button-label-login')}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default LoginForm;

{
  /* {errorMsg ? (
          <Alert
            message={t(errorMsg)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMsg('')}
          />
        ) : null} */
}
