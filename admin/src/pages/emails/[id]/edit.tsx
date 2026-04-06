import Layout from '@/components/layouts/admin';
import EmailForm from '@/components/emails/email-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEmailCampaignQuery } from '@/data/emails';

export default function UpdateEmailCampaignPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { id },
  } = router;

  const { data, isLoading, error } = useEmailCampaignQuery(id as string);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Edit Email Campaign</h1>
      </div>
      <EmailForm initialValues={data} />
    </>
  );
}

UpdateEmailCampaignPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
    },
  };
};
