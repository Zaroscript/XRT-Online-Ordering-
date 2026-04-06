import Layout from '@/components/layouts/admin';
import SmsForm from '@/components/sms/sms-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useSmsCampaignQuery } from '@/data/sms';

export default function UpdateSmsCampaignPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { id },
  } = router;

  const { data, isLoading, error } = useSmsCampaignQuery(id as string);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Edit SMS Campaign</h1>
      </div>
      <SmsForm initialValues={data} />
    </>
  );
}

UpdateSmsCampaignPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
    },
  };
};
