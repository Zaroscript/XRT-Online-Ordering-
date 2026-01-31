import ModifierList from '@/components/modifier/modifier-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
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
import { useModifiersQuery } from '@/data/modifier';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';

export default function Modifiers() {
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation(['common', 'form', 'table']);
  const [orderBy, setOrder] = useState('sort_order');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Asc);
  const { modifiers, paginatorInfo, loading, error } = useModifiersQuery({
    limit: 20,
    page,
    name: searchTerm,
    orderBy,
    sortedBy,
    language: locale,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading
              title={t('form:input-label-modifiers') || 'All Modifiers'}
            />
          </div>

          <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-3/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />

            {locale === Config.defaultLanguage &&
              (getAuthCredentials().role === 'super_admin' ||
                hasPermission(
                  ['categories:create'],
                  getAuthCredentials().permissions,
                )) && (
                <>
                  <LinkButton
                    href={Routes.modifier.create}
                    className="h-12 w-full md:w-auto md:ms-6"
                  >
                    {t('form:button-label-add-modifier') || 'Add Modifier'}
                  </LinkButton>
                  <LinkButton
                    href={`${Routes.modifierGroup.list}`}
                    className="h-12 w-full md:w-auto md:ms-6"
                  >
                    <span className="block md:hidden xl:block">
                      {t('form:button-label-manage-modifier-groups') ||
                        'Manage Groups'}
                    </span>
                    <span className="hidden md:block xl:hidden">
                      {t('form:button-label-groups') || 'Groups'}
                    </span>
                  </LinkButton>
                </>
              )}
          </div>
        </div>
      </Card>
      <ModifierList
        modifiers={modifiers}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}

Modifiers.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['categories:read'],
};
Modifiers.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
