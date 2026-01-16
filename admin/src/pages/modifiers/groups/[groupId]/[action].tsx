import Layout from '@/components/layouts/admin';
import CreateOrUpdateModifierGroupForm from '@/components/modifier-group/modifier-group-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useModifierGroupQuery } from '@/data/modifier-group';
import { adminOnly, getAuthCredentials, hasPermission, hasAccess } from '@/utils/auth-utils';
import { SUPER_ADMIN } from '@/utils/constants';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';

export default function UpdateModifierGroupPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { group, error, isLoading } = useModifierGroupQuery({
    id: query.groupId as string,
    slug: query.groupId as string,
    language: locale!,
  });

  const { permissions, role } = getAuthCredentials();
  // Allow super admin or users with modifier_groups:update permission
  if (role !== SUPER_ADMIN && !hasPermission(['modifier_groups:update'], permissions)) {
    return <ErrorMessage message={t('common:text-permission-denied')} />;
  }

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (query.action === 'edit') {
    return (
      <div className="flex flex-col space-y-4 sm:space-y-5 w-full max-w-full overflow-x-hidden">
        {/* Breadcrumb Navigation */}
        <Card className="p-3 sm:p-4 w-full max-w-full">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={Routes.modifierGroup.list}
              className="text-body hover:text-accent transition-colors flex items-center gap-1"
            >
              <IosArrowLeft width={16} className="sm:hidden" />
              <span className="hidden sm:inline">{t('form:input-label-modifier-groups') || 'Modifier Groups'}</span>
              <span className="sm:hidden">{t('form:input-label-modifier-groups-short') || 'Groups'}</span>
            </Link>
            <span className="text-gray-400">/</span>
            {group && (
              <>
                <Link
                  href={Routes.modifierGroup.details(group.id)}
                  className="text-body hover:text-accent transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {group.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-heading font-medium truncate">
              {t('form:form-title-edit-modifier-group') || 'Edit'}
            </span>
          </div>
        </Card>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-dashed border-border-base pb-4 sm:pb-6">
          <div className="flex items-center gap-3">
            <Link
              href={Routes.modifierGroup.list}
              className="text-body hover:text-accent transition-colors hidden sm:block"
              title={t('common:text-back')}
            >
              <IosArrowLeft width={20} />
            </Link>
            <h1 className="text-base sm:text-lg font-semibold text-heading">
              {t('form:form-title-edit-modifier-group') || 'Edit Modifier Group'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <CreateOrUpdateModifierGroupForm initialValues={group} />
      </div>
    );
  }

  return null;
}

UpdateModifierGroupPage.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['modifier_groups:update'],
};
UpdateModifierGroupPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

