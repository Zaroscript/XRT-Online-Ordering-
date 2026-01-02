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
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
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
      <h3 className="mb-6 mt-4 text-center text-base italic text-body">
        {t('admin-login-title')}
      </h3>
      <LoginForm />
    </AuthPageLayout>
  );
}
