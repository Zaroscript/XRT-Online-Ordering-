import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import CustomerForm from '@/components/customer/customer-form';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';

export default function CreateCustomerPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5 md:mb-7">
        <PageHeading title={t('form:form-title-create-customer')} />
      </div>
      <CustomerForm />
    </>
  );
}

CreateCustomerPage.authenticate = {
  permissions: adminOnly,
};
CreateCustomerPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
