import Layout from '@/components/layouts/admin';
import CreateEmailForm from '@/components/emails/email-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';

export default function CreateEmailPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <PageHeading title={t('form:form-title-create-email')} />
      </div>
      <CreateEmailForm />
    </>
  );
}

CreateEmailPage.authenticate = {
  permissions: adminOnly,
};

CreateEmailPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
