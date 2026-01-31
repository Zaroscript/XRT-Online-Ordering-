import CategoryList from '@/components/category/category-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { SortOrder, Type } from '@/types';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import KitchenSectionFilter from '@/components/category/kitchen-section-filter';
import {
  adminOnly,
  getAuthCredentials,
  hasPermission,
} from '@/utils/auth-utils';
import { useCategoriesQuery } from '@/data/category';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';
import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { DownloadIcon } from '@/components/icons/download-icon';
import { UploadIcon } from '@/components/icons/upload-icon';

export default function Categories() {
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [kitchenSection, setKitchenSection] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation(['common', 'form', 'table']);
  const { openModal } = useModalAction();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const { categories, paginatorInfo, loading, error } = useCategoriesQuery({
    limit: 20,
    page,
    kitchen_section_id: kitchenSection,
    name: searchTerm,
    orderBy,
    sortedBy,
    parent: null,
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

  const handleExport = async () => {
    try {
      // Use HttpClient to request with auth headers but handle blob response manually if needed
      // Or just use window.open if cookies/auth allows.
      // Since we use Bearer token, we need to fetch blob and download.
      const response = await HttpClient.get<string>(
        `${API_ENDPOINTS.CATEGORY_EXPORT}`,
        { responseType: 'blob' } as any,
      );

      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'categories-export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('form:input-label-categories')} />
          </div>

          <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-3/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />

            <KitchenSectionFilter
              className="md:ms-6"
              onKitchenSectionFilter={(option: any) => {
                setKitchenSection(option?.value ?? '');
                setPage(1);
              }}
            />

            <div className="flex items-center space-x-3 md:ms-6">
              {/* Import/Export moved to separate page */}
            </div>

            {locale === Config.defaultLanguage &&
              (getAuthCredentials().role === 'super_admin' ||
                hasPermission(
                  ['categories:create'],
                  getAuthCredentials().permissions,
                )) && (
                <LinkButton
                  href={`${Routes.category.create}`}
                  className="h-12 w-full md:w-auto md:ms-6"
                >
                  <span className="block md:hidden xl:block">
                    + {t('form:button-label-add-categories')}
                  </span>
                  <span className="hidden md:block xl:hidden">
                    + {t('form:button-label-add')}
                  </span>
                </LinkButton>
              )}
          </div>
        </div>
      </Card>
      <CategoryList
        categories={categories}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}

Categories.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['categories:read'],
};
Categories.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
