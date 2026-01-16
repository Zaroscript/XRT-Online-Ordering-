import LoginForm from '@/components/auth/login-form';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AuthPageLayout from '@/components/layouts/auth-layout';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthCredentials, isAuthenticated } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form', 'errors'])),
  },
});

export default function LoginPage() {
  const router = useRouter();
  const { token, permissions } = getAuthCredentials();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (token && router.isReady) {
      router.push(Routes.dashboard);
    }
  }, [token, permissions, router]);

  return (
    <AuthPageLayout>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('admin-login-title') || 'Welcome to XRT Restaurant System'}
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Restaurant Management Platform
        </p>
      </div>
      <div className="mt-6">
        <LoginForm />
      </div>
    </AuthPageLayout>
  );
}
