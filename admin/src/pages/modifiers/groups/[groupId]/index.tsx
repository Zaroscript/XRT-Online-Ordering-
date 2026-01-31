import Layout from '@/components/layouts/admin';
import ModifierList from '@/components/modifier/modifier-list';
import Card from '@/components/common/card';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState, useEffect } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import {
  adminOnly,
  getAuthCredentials,
  hasPermission,
} from '@/utils/auth-utils';
import { useModifiersQuery, useModifierQuery } from '@/data/modifier';
import { useModifierGroupQuery } from '@/data/modifier-group';
import { useRouter } from 'next/router';
import PageHeading from '@/components/common/page-heading';
import Link from '@/components/ui/link';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import CreateOrUpdateModifierForm from '@/components/modifier/modifier-form';

export default function ModifierGroupDetailsPage() {
  const router = useRouter();
  const { groupId, editModifier, createModifier } = router.query;
  const { locale } = router;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation(['common', 'form', 'table']);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  // Fetch modifier group details
  const {
    group,
    isLoading: groupLoading,
    error: groupError,
  } = useModifierGroupQuery({
    id: groupId as string,
    slug: groupId as string,
    language: locale!,
  });

  // Fetch modifiers for editing
  const {
    modifier,
    isLoading: modifierLoading,
    error: modifierError,
  } = useModifierQuery({
    id: editModifier as string,
    slug: groupId as string, // Pass groupId as slug, since the hook maps slug to modifier_group_id
    language: locale!,
  });

  // Fetch modifiers filtered by group
  const { modifiers, paginatorInfo, loading, error } = useModifiersQuery({
    language: locale,
    limit: 20,
    page,
    modifier_group_id: groupId as string,
    name: searchTerm,
    orderBy,
    sortedBy,
  });

  // Clear query params after successful form submission
  const handleFormSuccess = () => {
    router.replace(Routes.modifierGroup.details(groupId as string), undefined, {
      shallow: true,
    });
  };

  if (groupLoading || (editModifier && modifierLoading) || loading)
    return <Loader text={t('common:text-loading')} />;
  if (groupError || (editModifier && modifierError) || error)
    return (
      <ErrorMessage
        message={
          groupError?.message || modifierError?.message || error?.message
        }
      />
    );

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  // Show modifier form if editing or creating
  if (editModifier || createModifier) {
    return (
      <>
        {/* Breadcrumb Navigation */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={Routes.modifierGroup.list}
              className="text-body hover:text-accent transition-colors"
            >
              {t('form:input-label-modifier-groups')}
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={Routes.modifierGroup.details(groupId as string)}
              className="text-body hover:text-accent transition-colors"
            >
              {group?.name || t('common:text-loading')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-heading font-medium">
              {editModifier
                ? t('form:form-title-edit-modifier') || 'Edit Modifier'
                : t('form:form-title-create-modifier') || 'Create Modifier'}
            </span>
          </div>
        </Card>

        <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5">
          <h1 className="text-lg font-semibold text-heading">
            {editModifier
              ? t('form:form-title-edit-modifier') || 'Edit Modifier'
              : t('form:form-title-create-modifier') || 'Create Modifier'}
          </h1>
        </div>

        <CreateOrUpdateModifierForm
          initialValues={editModifier ? modifier : undefined}
          modifierGroupId={groupId as string}
          onSuccess={handleFormSuccess}
        />
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb Navigation */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={Routes.modifierGroup.list}
            className="text-body hover:text-accent transition-colors"
          >
            {t('form:input-label-modifier-groups')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-heading font-medium">
            {group?.name || t('common:text-loading')}
          </span>
        </div>
      </Card>

      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <div className="flex items-center gap-3">
              <Link
                href={Routes.modifierGroup.list}
                className="text-body hover:text-accent transition-colors"
                title={t('common:text-back')}
              >
                <IosArrowLeft width={18} />
              </Link>
              <PageHeading
                title={
                  group?.name
                    ? `${group.name} - ${t('form:input-label-modifiers')}`
                    : t('form:input-label-modifiers')
                }
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-center ms-auto md:w-2/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />
          </div>
          <div className="flex w-full md:w-auto mt-4 md:mt-0">
            <LinkButton
              href={`${Routes.modifierGroup.details(groupId as string)}?createModifier=true`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              {t('form:button-label-add-modifier') || 'Add Modifier'}
            </LinkButton>
          </div>
        </div>
      </Card>

      <ModifierList
        modifiers={modifiers}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
        enabledDnD={!searchTerm}
      />
    </>
  );
}

ModifierGroupDetailsPage.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['modifier_groups:read'],
};
ModifierGroupDetailsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
