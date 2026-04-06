import PageHeading from '@/components/common/page-heading';
import LandingSettingsForm from '@/components/settings/landing-settings-form';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSettingsQuery } from '@/data/settings';
import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function LandingSettingsPage() {
  const { locale } = useRouter();
  const { t } = useTranslation();
  const { settings, loading, error } = useSettingsQuery({
    language: locale!,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!settings)
    return (
      <ErrorMessage
        message={
          t('common:error-load-data') ?? 'Failed to load settings from server.'
        }
      />
    );

  return (
    <>
      <PageHeading title={t('common:text-landing-settings')} />
      <LandingSettingsForm settings={settings} />
    </>
  );
}

LandingSettingsPage.authenticate = {
  permissions: adminOnly,
};

LandingSettingsPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
  },
});
