import ProfileUpdateFrom from '@/components/auth/profile-update-form';
import ChangePasswordForm from '@/components/auth/change-password-from';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useMeQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AccountSettingsForm from '@/components/auth/email-update-form';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ProfileLayout from '@/components/layouts/profile';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const { data, isPending: loading, error } = useMeQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const activeTab = query.tab || 'general';

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <ProfileUpdateFrom me={data} />;
      case 'settings':
        return <AccountSettingsForm me={data} />;
      case 'security':
        return <ChangePasswordForm />;
      default:
        return <ProfileUpdateFrom me={data} />;
    }
  };

  return (
    <div className="h-full">
      {/* Profile Header */}
      <div className="bg-light dark:bg-dark-250 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden">
          <Image
            src={data?.profile?.avatar?.thumbnail ?? '/avatar-placeholder.svg'}
            alt={data?.name ?? 'User Avatar'}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="text-center md:text-start">
          <h1 className="text-2xl font-bold text-heading mb-1">{data?.name}</h1>
          <p className="text-body text-sm mb-2">{data?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full uppercase tracking-wider">
              {data?.role}
            </span>
            {data?.isApproved && (
              <span className="px-3 py-1 bg-status-complete/10 text-status-complete text-xs font-semibold rounded-full">
                {t('common:text-approved')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-light dark:bg-dark-250 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-heading mb-6 border-b border-border-200 pb-4">
          {activeTab === 'general' && t('form:form-title-general-information')}
          {activeTab === 'settings' && t('form:form-title-account-settings')}
          {activeTab === 'security' && t('form:form-title-security')}
        </h2>
        {renderContent()}
      </div>
    </div>
  );
}

ProfilePage.Layout = ProfileLayout;
ProfilePage.authenticate = true;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
