import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import LoyaltySettingsForm from '@/components/loyalty/loyalty-settings-form';
import { useLoyaltyProgramQuery } from '@/data/loyalty';

export default function LoyaltySettingsPage() {
  const { t } = useTranslation();
  const { program, loading, error } = useLoyaltyProgramQuery();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5 md:mb-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-loyalty-settings', 'Loyalty Program Settings')}
        </h1>
      </div>
      
      <LoyaltySettingsForm initialValues={program} />
    </>
  );
}

LoyaltySettingsPage.authenticate = {
  permissions: adminOnly,
};

LoyaltySettingsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
