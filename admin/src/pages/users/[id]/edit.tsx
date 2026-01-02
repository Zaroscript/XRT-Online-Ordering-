import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import UserForm from '@/components/user/user-form';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useUserQuery } from '@/data/user';
import { useRouter } from 'next/router';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

export default function UpdateUserPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = router.query;

    const { data: user, isLoading, error } = useUserQuery({ id: id as string });

    if (isLoading) {
        return <Loader text={t('common:text-loading')} />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <>
            <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5 md:mb-7">
                <PageHeading title={t('form:form-title-edit-user')} />
            </div>
            <UserForm initialValues={user} />
        </>
    );
}

UpdateUserPage.authenticate = {
    permissions: adminOnly,
};
UpdateUserPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
    },
});
