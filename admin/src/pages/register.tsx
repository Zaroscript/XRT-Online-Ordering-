import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import RegistrationForm from '@/components/auth/registration-form';
import { useRouter } from 'next/router';
import { getAuthCredentials, isAuthenticated } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import AuthPageLayout from '@/components/layouts/auth-layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form', 'errors'])),
  },
});

export default function RegisterPage() {
  const router = useRouter();
  const { token, permissions } = getAuthCredentials();
  if (isAuthenticated({ token, permissions })) {
    router.replace(Routes.dashboard);
  }
  const { t } = useTranslation('common');
  return (
    <AuthPageLayout>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('admin-register-title') || 'Welcome to XRT Restaurant System'}
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Create your account to get started
        </p>
      </div>
      <div className="mt-6">
        <RegistrationForm />
      </div>
    </AuthPageLayout>
  );
}
