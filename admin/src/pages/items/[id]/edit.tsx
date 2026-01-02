import ShopLayout from '@/components/layouts/shop';
import CreateOrUpdateItemForm from '@/components/item/item-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    adminOnly,
    adminOwnerAndStaffOnly,
    getAuthCredentials,
    hasAccess,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useShopQuery } from '@/data/shop';
import { useMeQuery } from '@/data/user';
import { useRouter } from 'next/router';
import { useItemQuery } from '@/data/item';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

export default function EditItemPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const {
        query: { shop, id },
        locale,
    } = useRouter();
    const { permissions } = getAuthCredentials();
    const { data: me } = useMeQuery();
    const { data: shopData } = useShopQuery({
        slug: shop as string,
    });
    const shopId = shopData?.id!;

    const { item, isLoading: loading, error } = useItemQuery({
        id: id as string,
        language: locale!,
    }, {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });

    if (loading) return <Loader text={t('common:text-loading')} />;
    if (error) return <ErrorMessage message={error.message} />;

    if (
        !hasAccess(adminOnly, permissions) &&
        !me?.shops?.map((shop) => shop.id).includes(shopId) &&
        me?.managed_shop?.id != shopId
    ) {
        router.replace(Routes.dashboard);
    }

    return (
        <>
            <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
                <h1 className="text-lg font-semibold text-heading">
                    {t('form:form-title-edit-item')}
                </h1>
            </div>
            {item && (
                <CreateOrUpdateItemForm 
                    key={`item-${item.id}-${item.updated_at || Date.now()}`}
                    initialValues={item} 
                />
            )}
        </>
    );
}
EditItemPage.authenticate = {
    permissions: adminOwnerAndStaffOnly,
};
EditItemPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['form', 'common'])),
    },
});
