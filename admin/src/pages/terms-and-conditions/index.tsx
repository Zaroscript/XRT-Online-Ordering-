import Layout from '@/components/layouts/admin';
import PageHeading from '@/components/common/page-heading';
import TermsPageSettingsForm from '@/components/terms-and-conditions/terms-page-settings-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useSettingsQuery } from '@/data/settings';

export default function TermsAndConditions() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { settings, loading, error } = useSettingsQuery({
    language: locale!,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!settings) {
    return (
      <ErrorMessage
        message={t('common:error-load-data') ?? 'Failed to load settings from server.'}
      />
    );
  }

  return (
    <>
      <PageHeading title={t('text-terms-conditions')} />
      <TermsPageSettingsForm settings={settings} />
    </>
  );
}

TermsAndConditions.authenticate = {
  permissions: adminOnly,
};

TermsAndConditions.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
