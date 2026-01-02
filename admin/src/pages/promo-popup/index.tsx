import AdminLayout from '@/components/layouts/admin';
import PromoPopUpSettingsForm from '@/components/settings/promo-popup';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSettingsQuery } from '@/data/settings';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function PromotionPopup() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { settings, loading, error } = useSettingsQuery({
    language: locale! as string,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="md:w-1/4">
          <PageHeading title={t('form:text-popup-settings')} />
        </div>
      </Card>
      <PromoPopUpSettingsForm settings={settings} />
    </>
  );
}
PromotionPopup.authenticate = {
  permissions: adminOnly,
};
PromotionPopup.Layout = AdminLayout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
