import AdminLayout from '@/components/layouts/admin';
import SettingsPageHeader from '@/components/settings/settings-page-header';
import SocialSettingsForm from '@/components/settings/social';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSettingsQuery } from '@/data/settings';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function SocialSettings() {
    const { t } = useTranslation();
    const { locale } = useRouter();
    const { settings, loading, error } = useSettingsQuery({
        language: locale! as string,
    });

    if (loading) return <Loader text={t('common:text-loading')} />;
    if (error) return <ErrorMessage message={error.message} />;

    return (
        <>
            <SettingsPageHeader pageTitle="form:social-settings" />
            <SocialSettingsForm settings={settings} />
        </>
    );
}

SocialSettings.authenticate = {
    permissions: adminOnly,
};
SocialSettings.Layout = AdminLayout;

export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['form', 'common'])),
    },
});
