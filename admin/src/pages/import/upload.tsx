import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { importClient } from '@/data/client/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useRouter } from 'next/router';
import ErrorMessage from '@/components/ui/error-message';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from '@/components/icons/import-export-icons';
import { ChevronRight } from '@/components/icons/chevron-right';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import { PlusIcon } from '@/components/icons/plus-icon';
import { TrashIcon } from '@/components/icons/trash';
import { IMPORT_ENTITIES, EntityTypeId } from '@/config/import-entities';
import cn from 'classnames';

const ImportUploadPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [forcedType, setForcedType] = useState<EntityTypeId | ''>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(
      (file) => file.name.endsWith('.csv') || file.name.endsWith('.zip'),
    );
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setGlobalError(null);
    } else {
      setGlobalError(t('common:invalid-file-type-csv-zip'));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    addFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Pass the forced type ONLY if the user explicitly opened advanced settings and picked one
      const typeToPass = showAdvanced && forcedType !== '' ? forcedType : 'categories'; // Default to categories; server auto-detects anyway
      
      // Parse the first file to create the session
      const firstFile = files[0];
      const result = await importClient.parseFile(firstFile, typeToPass);
      const session = (result as any)?.data || result;
      const sessionId = session?.id;

      if (!sessionId) {
        throw new Error('Failed to get session ID from server response');
      }

      // Append remaining files
      for (let i = 1; i < files.length; i++) {
        await importClient.appendFile(sessionId, files[i], typeToPass);
      }

      // Go to review
      router.push(Routes.import.review.replace(':id', sessionId));
    } catch (err: any) {
      setGlobalError(
        err?.response?.data?.message || err?.message || t('common:upload-failed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-body">
        <Link href={Routes.import.list} className="hover:text-accent transition-colors">
          {t('common:text-import-export')}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-heading font-medium">{t('common:text-import')}</span>
      </div>

      <Card className="mb-6 border border-border-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(Routes.import.list)}
            className="text-body hover:text-accent transition-colors hidden sm:block"
          >
            <IosArrowLeft width={18} />
          </button>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <ArrowUpTrayIcon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <PageHeading title={t('common:text-import')} />
            <p className="mt-1 text-sm text-body">
              {t('common:import-upload-description')}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-2 block font-semibold text-heading">
            {t('common:upload-files-label', 'Upload CSV files')}
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all min-h-[250px]',
              dragActive
                ? 'border-accent bg-accent/5'
                : 'border-border-200 bg-gray-50/50 hover:border-accent/40 dark:bg-gray-800/30 dark:border-gray-600',
            )}
          >
            <input
              type="file"
              multiple
              accept=".csv,.zip"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {files.length === 0 ? (
              <div className="text-center">
                <ArrowUpTrayIcon className="mx-auto mb-3 h-12 w-12 text-body" />
                <p className="text-base text-body font-medium">
                  <span className="text-accent">{t('common:click-to-upload')}</span>{' '}
                  {t('common:or-drag-and-drop')}
                </p>
                <p className="mt-1 text-sm text-gray-400">CSV or ZIP files only</p>
              </div>
            ) : (
              <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-200 p-4">
                <div className="flex items-center justify-between mb-3 border-b border-border-200 pb-3">
                  <h4 className="font-semibold text-heading">
                    {files.length} {files.length === 1 ? 'file' : 'files'} selected
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    className="relative z-20 pointer-events-auto"
                    onClick={() => {
                      // Hack to trigger the invisible input behind the card
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" /> Add more
                  </Button>
                </div>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 relative z-20 pointer-events-auto">
                  {files.map((file, i) => (
                    <li key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <DocumentArrowUpIcon className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-sm font-medium text-heading truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-body shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm font-medium text-accent hover:text-accent-hover focus:outline-none"
          >
            {showAdvanced ? '- Hide advanced settings' : '+ Show advanced settings'}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl border border-border-200 bg-gray-50/50 dark:bg-gray-800/20">
              <label className="mb-2 block text-sm font-semibold text-heading">
                Force Entity Type (Optional)
              </label>
              <p className="text-xs text-body mb-3">
                By default, the system automatically detects the data type from your CSV headers.
                If detection fails, you can force a specific type here.
              </p>
              <select
                value={forcedType}
                onChange={(e) => setForcedType(e.target.value as EntityTypeId)}
                className="w-full max-w-sm h-10 rounded-md border border-border-200 px-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="">Auto-detect from headers</option>
                {IMPORT_ENTITIES.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {globalError && (
          <div className="mb-6">
            <ErrorMessage message={globalError} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="border-border-200"
          >
            {t('common:text-cancel')}
          </Button>
          <Button loading={isSubmitting} disabled={files.length === 0 || isSubmitting}>
            {t('common:text-continue')} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
};

ImportUploadPage.authenticate = { permissions: adminOnly };
ImportUploadPage.Layout = Layout;
export default ImportUploadPage;

export const getServerSideProps = async ({ locale }: any) => ({
  props: { ...(await serverSideTranslations(locale, ['common', 'form'])) },
});
