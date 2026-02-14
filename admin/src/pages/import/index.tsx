import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { useImportSessionsQuery } from '@/data/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { Table } from '@/components/ui/table';
import Badge from '@/components/ui/badge/badge';
import { Routes } from '@/config/routes';
import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import {
  FolderIcon,
  CubeIcon,
  AdjustmentsIcon,
  StackIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  DocumentArrowUpIcon,
} from '@/components/icons/import-export-icons';
import { ChevronRight } from '@/components/icons/chevron-right';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import { TrashIcon } from '@/components/icons/trash';
import { BackIcon } from '@/components/icons/back-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';
import cn from 'classnames';

const ENTITY_TYPES = [
  {
    id: 'categories',
    name: 'Categories',
    description: 'Menu categories and kitchen sections',
    icon: FolderIcon,
    exportEndpoint: API_ENDPOINTS.CATEGORY_EXPORT,
    importEndpoint: API_ENDPOINTS.CATEGORY_IMPORT,
  },
  {
    id: 'items',
    name: 'Items',
    description: 'Menu items and products',
    icon: CubeIcon,
    exportEndpoint: 'items/export',
    importEndpoint: 'items/import',
  },
  {
    id: 'modifiers',
    name: 'Modifier Groups',
    description: 'Modifier groups configuration',
    icon: AdjustmentsIcon,
    exportEndpoint: 'modifier-groups/export',
    importEndpoint: 'modifier-groups/import',
  },
  {
    id: 'modifier_items',
    name: 'Modifier Items',
    description: 'Individual modifier options (basics only)',
    icon: AdjustmentsIcon,
    exportEndpoint: 'modifiers/export',
    importEndpoint: 'modifiers/import',
  },
  {
    id: 'sizes',
    name: 'Sizes',
    description: 'Item size variations',
    icon: StackIcon,
    exportEndpoint: 'sizes/export',
    importEndpoint: 'sizes/import',
  },
];

const ImportExportPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'actions' | 'history'>('actions');
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const { sessions, isLoading, error } = useImportSessionsQuery();
  const { openModal } = useModalAction();
  // removed separate mutation and loading state here as it's now handled in the modal

  const handleRollback = (id: string) => {
    openModal('ROLLBACK_IMPORT_SESSION', id);
  };

  const handleExport = async (entityType: (typeof ENTITY_TYPES)[0]) => {
    setExportLoading(entityType.id);
    try {
      const response = await HttpClient.get<string>(entityType.exportEndpoint, {
        responseType: 'blob',
      } as any);

      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${entityType.id}-export-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert(`Export failed for ${entityType.name}`);
    } finally {
      setExportLoading(null);
    }
  };

  const handleImport = (entityType: (typeof ENTITY_TYPES)[0]) => {
    router.push({
      pathname: Routes.import.upload,
      query: { type: entityType.id },
    });
  };

  const columns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const map: Record<string, string> = {
          draft: 'bg-gray-500',
          validated: 'bg-accent',
          confirmed: 'bg-green-500',
          discarded: 'bg-red-500',
          rolled_back: 'bg-gray-400',
        };
        return <Badge text={status} color={map[status] || 'bg-gray-500'} />;
      },
    },
    {
      title: t('common:type'),
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (type: string) => (
        <span className="capitalize font-medium text-heading">
          {type || 'categories'}
        </span>
      ),
    },
    {
      title: t('common:items-count'),
      dataIndex: 'parsedData',
      key: 'items',
      width: 100,
      render: (data: any) => (
        <span className="text-body">{data?.items?.length ?? 0}</span>
      ),
    },
    {
      title: t('common:errors'),
      dataIndex: 'validationErrors',
      key: 'errors',
      width: 100,
      render: (errors: any[]) => (
        <span
          className={errors?.length ? 'text-red-600 font-medium' : 'text-body'}
        >
          {errors?.length || 0}
        </span>
      ),
    },
    {
      title: t('common:created-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <span className="text-body text-sm">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'id',
      key: 'actions',
      width: 140,
      render: (sid: string, record: any) => (
        <div className="flex gap-2">
          {record.status !== 'discarded' && record.status !== 'rolled_back' && (
            <Button
              size="small"
              className="bg-accent hover:bg-accent-hover text-white border-0"
              onClick={() =>
                router.push(Routes.import.review.replace(':id', sid))
              }
            >
              {t('common:review')}
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button
              size="small"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={() => handleRollback(sid)}
            >
              <BackIcon className="h-4 w-4 mr-1.5" />
              {t('common:rollback')}
            </Button>
          )}
          <button
            onClick={() => openModal('DELETE_IMPORT_SESSION', sid)}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none p-2"
            title={t('common:text-delete')}
          >
            <TrashIcon width={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-body">
        <span className="text-heading font-medium">
          {t('common:text-import-export')}
        </span>
      </div>

      {/* Header */}
      <Card className="mb-6 border border-border-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="text-body hover:text-accent transition-colors"
                  title={t('common:text-back')}
                >
                  <IosArrowLeft width={18} />
                </button>
                <PageHeading title={t('common:text-import-export')} />
              </div>
              {sessions?.length > 0 && activeTab === 'history' && (
                <Button
                  size="small"
                  className="bg-red-500 hover:bg-red-600 text-white md:hidden"
                  onClick={() => openModal('CLEAR_IMPORT_HISTORY')}
                >
                  <TrashIcon className="h-4 w-4 mr-1.5" />
                  <span className="sr-only">{t('common:clear-history')}</span>
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-body">
              {t('common:import-export-description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {sessions?.length > 0 && activeTab === 'history' && (
              <Button
                size="small"
                className="bg-red-500 hover:bg-red-600 text-white hidden md:inline-flex"
                onClick={() => openModal('CLEAR_IMPORT_HISTORY')}
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                {t('common:clear-history')}
              </Button>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-4 py-2">
              <DocumentArrowUpIcon className="h-5 w-5 text-accent" />
              <span className="text-sm text-body">
                {t('common:csv-or-zip-file')} • {t('common:parse-and-validate')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs - system theme */}
      <div className="mb-6 flex rounded-xl border border-border-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('actions')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all',
            activeTab === 'actions'
              ? 'bg-accent text-white shadow-md'
              : 'text-body hover:text-accent hover:bg-gray-50',
          )}
        >
          <ArrowDownTrayIcon
            className={cn(
              'h-4 w-4',
              activeTab === 'actions' ? 'text-white' : 'text-current',
            )}
          />
          {t('common:text-import-export')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all',
            activeTab === 'history'
              ? 'bg-accent text-white shadow-md'
              : 'text-body hover:text-accent hover:bg-gray-50',
          )}
        >
          <ClockIcon
            className={cn(
              'h-4 w-4',
              activeTab === 'history' ? 'text-white' : 'text-current',
            )}
          />
          {t('common:import-history')}
        </button>
      </div>

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ENTITY_TYPES.map((entity) => {
            const IconComponent = entity.icon;
            return (
              <Card
                key={entity.id}
                className="group relative overflow-hidden border border-border-200 shadow-sm hover:shadow-md hover:border-accent/30 transition-all"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-accent" />
                <div className="p-5 pt-6">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                      <IconComponent className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-heading truncate">
                        {entity.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-body line-clamp-2">
                        {entity.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="small"
                      className="flex-1 border-border-200 text-heading hover:border-accent hover:bg-accent hover:text-white transition-colors"
                      onClick={() => handleExport(entity)}
                      loading={exportLoading === entity.id}
                      disabled={exportLoading !== null}
                    >
                      <ArrowDownTrayIcon className="mr-1.5 h-4 w-4" />
                      {t('common:text-export')}
                    </Button>
                    <Button
                      size="small"
                      className="flex-1 bg-accent hover:bg-accent-hover text-white border-0"
                      onClick={() => handleImport(entity)}
                    >
                      <ArrowUpTrayIcon className="mr-1.5 h-4 w-4" />
                      {t('common:text-import')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="border border-border-200 shadow-sm">
          {isLoading ? (
            <Loader text={t('common:text-loading')} />
          ) : error ? (
            <ErrorMessage message={(error as any)?.message} />
          ) : (
            <Table
              columns={columns}
              data={sessions}
              rowKey="id"
              scroll={{ x: 800 }}
              emptyText={() => (
                <div className="flex flex-col items-center py-12 px-4">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                    <ClockIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-base font-semibold text-heading mb-1">
                    {t('common:no-import-sessions')}
                  </p>
                  <p className="text-sm text-body text-center max-w-sm mb-4">
                    {t('common:start-by-uploading-a-file')}
                  </p>
                  <Button
                    className="bg-accent hover:bg-accent-hover text-white"
                    onClick={() => setActiveTab('actions')}
                  >
                    <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                    {t('common:text-import')}
                  </Button>
                </div>
              )}
            />
          )}
        </Card>
      )}
    </>
  );
};

ImportExportPage.authenticate = {
  permissions: adminOnly,
};
ImportExportPage.Layout = Layout;

export default ImportExportPage;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
