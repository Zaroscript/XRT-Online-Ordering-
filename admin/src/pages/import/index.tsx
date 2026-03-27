import { useState } from 'react';
import { toast } from 'react-toastify';
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
import { importClient } from '@/data/client/import';
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

import { IMPORT_ENTITIES, ImportEntity } from '@/config/import-entities';

const ImportExportPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'actions' | 'history'>('actions');
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [exportAllLoading, setExportAllLoading] = useState(false);
  const { sessions, isLoading, error } = useImportSessionsQuery();
  const { openModal } = useModalAction();

  const [isQuickImporting, setIsQuickImporting] = useState(false);
  const [quickImportError, setQuickImportError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleQuickImportDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.zip')) {
      setQuickImportError(t('common:invalid-file-type-csv-zip') || 'Invalid file type');
      return;
    }

    setIsQuickImporting(true);
    setQuickImportError(null);
    try {
      const result = await importClient.parseFile(file, 'categories');
      const session = (result as any)?.data || result;
      if (session?.id) {
        router.push(Routes.import.review.replace(':id', session.id));
      }
    } catch (err: any) {
      setQuickImportError(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setIsQuickImporting(false);
    }
  };

  const handleQuickImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsQuickImporting(true);
    setQuickImportError(null);
    try {
      const result = await importClient.parseFile(file, 'categories');
      const session = (result as any)?.data || result;
      if (session?.id) {
        router.push(Routes.import.review.replace(':id', session.id));
      }
    } catch (err: any) {
      setQuickImportError(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setIsQuickImporting(false);
    }
    e.target.value = '';
  };

  const handleRollback = (id: string) => {
    openModal('ROLLBACK_IMPORT_SESSION', id);
  };

  const handleExport = async (entityType: ImportEntity) => {
    setExportLoading(entityType.id);
    try {
      // Second arg is query params; Axios options (e.g. responseType) must be the third arg.
      const blob = await HttpClient.get<Blob>(entityType.exportEndpoint, undefined, {
        responseType: 'blob',
      });

      if (
        blob &&
        typeof (blob as Blob).type === 'string' &&
        (blob as Blob).type.includes('application/json')
      ) {
        const text = await (blob as Blob).text();
        let msg = `Export failed for ${entityType.name}`;
        try {
          const j = JSON.parse(text) as { message?: string };
          if (j?.message) msg = j.message;
        } catch {
          /* ignore */
        }
        toast.error(msg);
        return;
      }

      const fileBlob =
        blob instanceof Blob ? blob : new Blob([blob as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(fileBlob);
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
      toast.success(t('common:export-success') || `Successfully exported ${entityType.name}`);
    } catch (err) {
      console.error('Export failed', err);
      toast.error(t('common:export-failed') || `Export failed for ${entityType.name}`);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportAll = async () => {
    setExportAllLoading(true);
    try {
      const blob = await HttpClient.get<Blob>(`${API_ENDPOINTS.EXPORT_ALL || 'export/all'}`, undefined, {
        responseType: 'blob',
      });

      if (
        blob &&
        typeof (blob as Blob).type === 'string' &&
        (blob as Blob).type.includes('application/json')
      ) {
        const text = await (blob as Blob).text();
        let msg = `Bulk export failed`;
        try {
          const j = JSON.parse(text) as { message?: string };
          if (j?.message) msg = j.message;
        } catch { /* ignore */ }
        toast.error(msg);
        return;
      }

      const fileBlob = blob instanceof Blob ? blob : new Blob([blob as BlobPart], { type: 'application/zip' });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export-all-${new Date().toISOString().slice(0, 10)}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('common:export-success') || `Successfully exported all data as ZIP`);
    } catch (err) {
      console.error('Export all failed', err);
      toast.error(t('common:export-failed') || `Bulk export failed`);
    } finally {
      setExportAllLoading(false);
    }
  };

  const handleImport = (entityType: ImportEntity) => {
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
            {activeTab === 'actions' && (
              <Button
                size="small"
                variant="outline"
                className="border-border-200 text-heading hover:border-accent hover:bg-accent hover:text-white transition-colors"
                onClick={handleExportAll}
                loading={exportAllLoading}
                disabled={exportAllLoading}
              >
                <ArrowDownTrayIcon className="mr-1.5 h-4 w-4" />
                {t('common:text-export-all') || 'Export All as ZIP'}
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
        <>
          {quickImportError && (
            <div className="mb-6">
              <ErrorMessage message={quickImportError} />
            </div>
          )}
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleQuickImportDrop}
            className={cn(
              'mb-8 relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
              dragActive
                ? 'border-accent bg-accent/5'
                : 'border-border-200 bg-gray-50/50 hover:border-accent/40 dark:bg-gray-800/30 dark:border-gray-600',
            )}
          >
            <input
              type="file"
              accept=".csv,.zip"
              onChange={handleQuickImportFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isQuickImporting}
            />
            {isQuickImporting ? (
              <div className="text-center">
                <Loader text="Uploading & parsing..." />
              </div>
            ) : (
              <div className="text-center">
                <DocumentArrowUpIcon className="mx-auto mb-3 h-10 w-10 text-accent opacity-80" />
                <h3 className="text-base font-semibold text-heading mb-1">
                  Quick Import
                </h3>
                <p className="text-sm text-body">
                  <span className="text-accent font-medium">{t('common:click-to-upload')}</span>{' '}
                  {t('common:or-drag-and-drop')} a CSV or ZIP file here
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Data type will be auto-detected
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
              <FolderIcon className="w-5 h-5 text-accent" />
              Entity Specific Actions
            </h2>
            <p className="text-sm text-body mt-1">Download templates, export data, or start a specific import</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {IMPORT_ENTITIES.map((entity) => {
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
                  <div className="mt-4 pt-4 border-t border-border-200 text-center">
                    <a
                      href={entity.template}
                      download
                      className="text-xs font-medium text-accent hover:text-accent-hover transition-colors inline-block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('common:download-template') || 'Download Template'}
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        </>
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
