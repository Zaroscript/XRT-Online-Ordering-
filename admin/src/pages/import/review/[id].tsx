import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import {
  useImportSessionQuery,
  useUpdateImportSessionMutation,
  useFinalSaveImportMutation,
  useDiscardImportSessionMutation,
  useDownloadImportErrorsMutation,
  useAppendImportFileMutation,
} from '@/data/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import ImportReviewModule from '@/components/import/import-review-module';
import Alert from '@/components/ui/alert';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from '@/components/icons/import-export-icons';
import { ChevronRight } from '@/components/icons/chevron-right';
import { DownloadIcon } from '@/components/icons/download-icon';
import { TrashIcon } from '@/components/icons/trash';
import { SaveIcon } from '@/components/icons/save';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import cn from 'classnames';

export default function ImportReviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { session, isLoading, error } = useImportSessionQuery(id as string);
  const { mutate: updateSession, isPending: isUpdating } =
    useUpdateImportSessionMutation();
  const { mutate: finalSave, isPending: isSaving } =
    useFinalSaveImportMutation();
  const { mutate: discardSession, isPending: isDiscarding } =
    useDiscardImportSessionMutation();
  const { mutate: downloadErrors, isPending: isDownloading } =
    useDownloadImportErrorsMutation();
  const { mutate: appendFile, isPending: isAppending } =
    useAppendImportFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleSaveDraft = (updatedData: any) => {
    updateSession({
      id: id as string,
      parsedData: updatedData,
    });
  };

  const handleFinalSave = () => {
    if (session?.validationErrors && session.validationErrors.length > 0) {
      return;
    }
    finalSave(id as string);
  };

  const handleDiscard = () => {
    if (showDiscardConfirm) {
      discardSession(id as string);
    } else {
      setShowDiscardConfirm(true);
    }
  };

  const handleDownloadErrors = () => {
    downloadErrors(id as string);
  };

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      appendFile({ id: id as string, file });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as any)?.message} />;
  if (!session)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <ErrorMessage message={t('common:import-session-not-found')} />
        <Link
          href={Routes.import.list}
          className="mt-4 text-accent hover:text-accent-hover font-medium"
        >
          {t('common:text-back')} → {t('common:text-import-export')}
        </Link>
      </div>
    );

  const hasErrors =
    session.validationErrors && session.validationErrors.length > 0;
  const hasWarnings =
    session.validationWarnings && session.validationWarnings.length > 0;
  const filesList = session.originalFiles?.length ? session.originalFiles : [];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link
          href={Routes.import.list}
          className="text-body hover:text-accent transition-colors font-medium"
        >
          {t('common:text-import-export')}
        </Link>
        <ChevronRight className="h-4 w-4 text-body shrink-0 opacity-70" />
        <span className="text-heading font-semibold truncate">
          {t('common:review-import')}
        </span>
      </div>

      {/* Header card with title and status */}
      <Card className="mb-6 border border-border-200 shadow-sm bg-light">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => router.push(Routes.import.list)}
              className="shrink-0 mt-0.5 p-2 rounded-lg text-body hover:text-accent hover:bg-accent/10 transition-colors border border-transparent hover:border-border-200"
              title={t('common:text-back')}
              aria-label={t('common:text-back')}
            >
              <IosArrowLeft width={20} height={20} />
            </button>
            <div className="min-w-0">
              <PageHeading title={t('common:review-import')} />
              <p className="mt-2 text-sm font-medium text-heading leading-relaxed">
                {t('common:import-review-subtitle')}
              </p>
              {filesList.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-heading uppercase tracking-wide">
                    {t('common:import-files-included')}:
                  </span>
                  {filesList.map((f: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-lg border border-border-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-heading"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {hasErrors && (
              <span
                className="rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-300 ring-1 ring-red-200/60 dark:ring-red-800/60"
                role="status"
              >
                {session.validationErrors.length} {t('common:errors')}
              </span>
            )}
            {hasWarnings && (
              <span
                className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-200 ring-1 ring-amber-200/60 dark:ring-amber-800/60"
                role="status"
              >
                {session.validationWarnings.length} {t('common:warnings')}
              </span>
            )}
            {!hasErrors && (
              <span
                className="rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent ring-1 ring-accent/30"
                role="status"
              >
                {t('common:validated')}
              </span>
            )}
          </div>
        </div>
      </Card>

      {hasErrors && (
        <Alert
          message={t('common:fix-errors-before-saving')}
          variant="error"
          className="mb-6 border border-red-200 dark:border-red-800 rounded-xl text-heading font-medium"
        />
      )}

      {hasWarnings && (
        <Alert
          message={t('common:review-warnings')}
          variant="warning"
          className="mb-6 border border-amber-200 dark:border-amber-800 rounded-xl text-heading font-medium"
        />
      )}

      <ImportReviewModule
        session={session}
        onSaveDraft={handleSaveDraft}
        isUpdating={isUpdating}
      />

      {/* Action bar */}
      <Card className="mt-8 border border-border-200 shadow-sm bg-light">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="small"
              onClick={handleAddFileClick}
              disabled={isAppending || isUpdating || isSaving}
              className="border-border-200 text-heading font-medium hover:border-accent hover:text-accent hover:bg-accent/5"
              title={t('common:add-file')}
            >
              <ArrowUpTrayIcon className="mr-2 h-4 w-4 shrink-0" />
              {isAppending ? t('common:uploading') : t('common:add-file')}
            </Button>
            {hasErrors && (
              <Button
                variant="outline"
                size="small"
                onClick={handleDownloadErrors}
                disabled={isDownloading}
                className="border-border-200 text-heading font-medium hover:border-accent hover:text-accent hover:bg-accent/5"
                title={t('common:download-errors')}
              >
                <DownloadIcon className="mr-2 h-4 w-4 shrink-0" />
                {t('common:download-errors')}
              </Button>
            )}
            <Button
              variant="outline"
              size="small"
              onClick={() => handleSaveDraft(session.parsedData)}
              disabled={isUpdating}
              className="border-border-200 text-heading font-medium hover:border-accent hover:text-accent hover:bg-accent/5"
              title={t('common:save-draft')}
            >
              <SaveIcon className="mr-2 h-4 w-4 shrink-0" />
              {t('common:save-draft')}
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={handleDiscard}
              disabled={isDiscarding || showDiscardConfirm}
              className="border-red-200 text-red-600 font-medium hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              title={
                showDiscardConfirm
                  ? t('common:confirm-discard')
                  : t('common:discard-import')
              }
            >
              <TrashIcon className="mr-2 h-4 w-4 shrink-0" />
              {showDiscardConfirm
                ? t('common:confirm-discard')
                : t('common:discard-import')}
            </Button>
            {showDiscardConfirm && (
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowDiscardConfirm(false)}
                className="border-border-200 text-heading font-medium"
              >
                {t('common:text-cancel')}
              </Button>
            )}
          </div>
          <Button
            size="small"
            onClick={handleFinalSave}
            disabled={hasErrors || isSaving}
            loading={isSaving}
            className={cn(
              'w-full lg:w-auto bg-accent hover:bg-accent-hover text-white border-0 shrink-0 font-semibold',
              hasErrors && 'opacity-50 cursor-not-allowed',
            )}
            title={
              hasErrors
                ? t('common:fix-errors-before-saving')
                : t('common:save-to-database')
            }
          >
            <DocumentArrowUpIcon className="mr-2 h-4 w-4 shrink-0" />
            {isSaving
              ? t('common:saving-to-database')
              : t('common:save-to-database')}
          </Button>
        </div>
      </Card>
    </>
  );
}

ImportReviewPage.authenticate = {
  permissions: adminOnly,
};
ImportReviewPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
