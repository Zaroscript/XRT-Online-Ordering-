import Layout from '@/components/layouts/admin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import CreateSmsForm from '@/components/sms/sms-form';
import PageHeading from '@/components/common/page-heading';
import { useTranslation } from 'next-i18next';

export default function CreateSmsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeading title={t('form:form-title-create-sms')} />
      <CreateSmsForm />
    </>
  );
}

CreateSmsPage.authenticate = {
  permissions: adminOnly,
};
CreateSmsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
