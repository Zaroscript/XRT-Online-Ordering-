import Layout from '@/components/layouts/admin';
import RoleForm from '@/components/role/role-form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { adminOnly } from '@/utils/auth-utils';

export default function CreateRolePage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="py-5 sm:py-8 flex border-b border-dashed border-border-base">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-role')}
        </h1>
      </div>
      <RoleForm />
    </>
  );
}

CreateRolePage.authenticate = {
  permissions: adminOnly,
};
CreateRolePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
