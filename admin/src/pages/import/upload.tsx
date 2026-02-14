import { useState, useCallback } from 'react';
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
  FolderIcon,
  CubeIcon,
  AdjustmentsIcon,
  StackIcon,
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from '@/components/icons/import-export-icons';
import { ChevronRight } from '@/components/icons/chevron-right';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import { TrashIcon } from '@/components/icons/trash';
import { PlusIcon } from '@/components/icons/plus-icon';
import cn from 'classnames';

/* ------------------------------------------------------------------ */
/*  Entity type definitions                                           */
/* ------------------------------------------------------------------ */
const ENTITY_TYPES = [
  {
    id: 'categories' as const,
    labelKey: 'common:sidebar-nav-item-categories',
    descriptionKey: 'common:import-type-desc-categories',
    icon: FolderIcon,
  },
  {
    id: 'items' as const,
    labelKey: 'common:sidebar-nav-item-menu',
    descriptionKey: 'common:import-type-desc-items',
    icon: CubeIcon,
  },
  {
    id: 'modifierGroups' as const,
    labelKey: 'common:sidebar-nav-item-modifiers-management',
    descriptionKey: 'common:import-type-desc-modifier-groups',
    icon: AdjustmentsIcon,
  },
  {
    id: 'modifiers' as const,
    labelKey: 'common:sidebar-nav-item-modifier-items',
    descriptionKey: 'common:import-type-desc-modifiers',
    icon: AdjustmentsIcon,
  },
  {
    id: 'sizes' as const,
    labelKey: 'common:sidebar-nav-item-items-sizes',
    descriptionKey: 'common:import-type-desc-sizes',
    icon: StackIcon,
  },
] as const;

type EntityTypeId = (typeof ENTITY_TYPES)[number]['id'];

/* ------------------------------------------------------------------ */
/*  Upload slot type                                                  */
/* ------------------------------------------------------------------ */
interface UploadSlot {
  id: string; // unique key for React rendering
  entityType: EntityTypeId;
  file: File | null;
  dragActive: boolean;
  status: 'idle' | 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

const createSlot = (entityType?: EntityTypeId): UploadSlot => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  entityType: entityType || 'categories',
  file: null,
  dragActive: false,
  status: 'idle',
});

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */
const ImportUploadPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;

  // Pre-populate with one slot using optionally the type from the query string
  const initialType = (query.type as EntityTypeId) || 'categories';
  const [slots, setSlots] = useState<UploadSlot[]>([createSlot(initialType)]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Slot helpers ---------- */
  const updateSlot = useCallback(
    (slotId: string, patch: Partial<UploadSlot>) => {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const removeSlot = useCallback((slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  }, []);

  const addSlot = useCallback(() => {
    setSlots((prev) => [...prev, createSlot()]);
  }, []);

  /* ---------- Drag & drop handlers ---------- */
  const handleDrag = useCallback(
    (slotId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const active = e.type === 'dragenter' || e.type === 'dragover';
      updateSlot(slotId, { dragActive: active });
    },
    [updateSlot],
  );

  const handleDrop = useCallback(
    (slotId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      updateSlot(slotId, { dragActive: false });
      if (e.dataTransfer.files?.[0]) {
        updateSlot(slotId, {
          file: e.dataTransfer.files[0],
          status: 'idle',
          errorMessage: undefined,
        });
      }
    },
    [updateSlot],
  );

  const handleFileChange = useCallback(
    (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        updateSlot(slotId, {
          file: e.target.files[0],
          status: 'idle',
          errorMessage: undefined,
        });
      }
    },
    [updateSlot],
  );

  /* ---------- Submit all files ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const filledSlots = slots.filter((s) => s.file);
    if (filledSlots.length === 0) {
      setGlobalError(t('common:import-no-files-selected'));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload the first file to create a session
      const firstSlot = filledSlots[0];
      updateSlot(firstSlot.id, { status: 'uploading' });

      const result = await importClient.parse({
        file: firstSlot.file!,
        entity_type: firstSlot.entityType,
      });

      updateSlot(firstSlot.id, { status: 'done' });

      // Extract the session ID from the response
      const session = (result as any)?.data || result;
      const sessionId = session?.id;

      if (!sessionId) {
        throw new Error('Failed to get session ID from server response');
      }

      // 2. Append remaining files to the same session
      if (filledSlots.length > 1) {
        for (let i = 1; i < filledSlots.length; i++) {
          const slot = filledSlots[i];
          updateSlot(slot.id, { status: 'uploading' });
          try {
            await importClient.appendFile(
              sessionId,
              slot.file!,
              slot.entityType,
            );
            updateSlot(slot.id, { status: 'done' });
          } catch (err: any) {
            updateSlot(slot.id, {
              status: 'error',
              errorMessage:
                err?.response?.data?.message ||
                err?.message ||
                t('common:upload-failed'),
            });
          }
        }
      }

      // 3. Redirect to the preview/review page
      router.push(Routes.import.review.replace(':id', sessionId));
    } catch (err: any) {
      updateSlot(filledSlots[0].id, {
        status: 'error',
        errorMessage:
          err?.response?.data?.message ||
          err?.message ||
          t('common:upload-failed'),
      });
      setGlobalError(
        err?.response?.data?.message ||
          err?.message ||
          t('common:upload-failed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCount = slots.filter((s) => s.file).length;

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-body">
        <Link
          href={Routes.import.list}
          className="hover:text-accent transition-colors"
        >
          {t('common:text-import-export')}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-heading font-medium">
          {t('common:text-import')}
        </span>
      </div>

      {/* Header */}
      <Card className="mb-6 border border-border-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(Routes.import.list)}
            className="text-body hover:text-accent transition-colors hidden sm:block"
            title={t('common:text-back')}
          >
            <IosArrowLeft width={18} />
          </button>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <ArrowUpTrayIcon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <PageHeading title={t('common:text-import')} />
            <p className="mt-1 text-sm text-body">
              {t('common:import-multi-upload-description')}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Upload Slots */}
        <div className="space-y-4 mb-6">
          {slots.map((slot, index) => {
            const selectedEntity =
              ENTITY_TYPES.find((e) => e.id === slot.entityType) ||
              ENTITY_TYPES[0];
            const IconComp = selectedEntity.icon;

            return (
              <Card
                key={slot.id}
                className={cn(
                  'border shadow-sm transition-all',
                  slot.status === 'done'
                    ? 'border-green-300 bg-green-50/30 dark:bg-green-900/10'
                    : slot.status === 'error'
                      ? 'border-red-300 bg-red-50/30 dark:bg-red-900/10'
                      : 'border-border-200',
                )}
              >
                {/* Slot header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-heading">
                      {t('common:import-file-slot', { number: index + 1 })}
                    </span>
                    {slot.status === 'done' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-800/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        ✓ {t('common:upload-success')}
                      </span>
                    )}
                    {slot.status === 'uploading' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        {t('common:text-loading')}
                      </span>
                    )}
                  </div>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t('common:text-delete')}
                    >
                      <TrashIcon width={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Entity type selector */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-body">
                      {t('common:import-select-entity-type')}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {ENTITY_TYPES.map((entity) => {
                        const Icon = entity.icon;
                        const isSelected = slot.entityType === entity.id;
                        return (
                          <button
                            key={entity.id}
                            type="button"
                            onClick={() =>
                              updateSlot(slot.id, {
                                entityType: entity.id,
                              })
                            }
                            className={cn(
                              'flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all text-sm',
                              isSelected
                                ? 'border-accent bg-accent/5 shadow-sm'
                                : 'border-border-200 hover:border-accent/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0',
                                isSelected ? 'text-accent' : 'text-body',
                              )}
                            />
                            <span
                              className={cn(
                                'font-medium',
                                isSelected ? 'text-heading' : 'text-body',
                              )}
                            >
                              {t(entity.labelKey)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* File dropzone */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-body">
                      {t('common:csv-or-zip-file')}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragEnter={(e) => handleDrag(slot.id, e)}
                      onDragLeave={(e) => handleDrag(slot.id, e)}
                      onDragOver={(e) => handleDrag(slot.id, e)}
                      onDrop={(e) => handleDrop(slot.id, e)}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all min-h-[200px]',
                        slot.dragActive
                          ? 'border-accent bg-accent/5'
                          : slot.file
                            ? 'border-accent/50 bg-accent/5'
                            : 'border-border-200 bg-gray-50/50 hover:border-accent/40 dark:bg-gray-800/30 dark:border-gray-600',
                      )}
                    >
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(slot.id, e)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {slot.file ? (
                        <div className="text-center">
                          <DocumentArrowUpIcon className="mx-auto mb-2 h-10 w-10 text-accent" />
                          <p className="text-sm font-medium text-heading truncate max-w-[200px]">
                            {slot.file.name}
                          </p>
                          <p className="mt-0.5 text-xs text-body">
                            {(slot.file.size / 1024).toFixed(1)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSlot(slot.id, {
                                file: null,
                                status: 'idle',
                                errorMessage: undefined,
                              });
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            {t('common:remove-file')}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ArrowUpTrayIcon className="mx-auto mb-2 h-10 w-10 text-body" />
                          <p className="text-sm text-body">
                            <span className="font-semibold text-accent">
                              {t('common:click-to-upload')}
                            </span>{' '}
                            {t('common:or-drag-and-drop')}
                          </p>
                          <p className="mt-1 text-xs text-body">
                            {t('common:csv-zip-files-only')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Slot-level error */}
                    {slot.status === 'error' && slot.errorMessage && (
                      <p className="mt-2 text-xs text-red-600">
                        {slot.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add another file button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={addSlot}
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border-200 px-4 py-3 text-sm font-medium text-body hover:border-accent/40 hover:text-accent transition-all w-full justify-center"
          >
            <PlusIcon className="h-4 w-4" />
            {t('common:import-add-another-file')}
          </button>
        </div>

        {/* Summary */}
        {filledCount > 0 && (
          <Card className="mb-6 border border-accent/20 bg-accent/5 shadow-sm">
            <div className="flex items-center gap-3">
              <DocumentArrowUpIcon className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-heading">
                {t('common:import-upload-summary')}:
              </span>
              <span className="text-sm text-body">
                {filledCount} {t('common:import-total-files')}
              </span>
            </div>
          </Card>
        )}

        {/* Global error */}
        {globalError && <ErrorMessage message={globalError} />}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border-200 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(Routes.import.list)}
            disabled={isSubmitting}
            className="border-border-200 text-heading hover:border-accent hover:text-accent"
          >
            {t('common:text-cancel')}
          </Button>
          <Button
            type="submit"
            disabled={filledCount === 0 || isSubmitting}
            loading={isSubmitting}
            className="bg-accent hover:bg-accent-hover text-white border-0"
          >
            {isSubmitting
              ? t('common:text-loading')
              : t('common:parse-and-validate')}
          </Button>
        </div>
      </form>
    </>
  );
};

ImportUploadPage.authenticate = {
  permissions: adminOnly,
};
ImportUploadPage.Layout = Layout;

export default ImportUploadPage;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
