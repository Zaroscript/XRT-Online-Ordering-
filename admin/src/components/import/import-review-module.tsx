import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import { ImportSession } from '@/data/client/import';
import Button from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';

import EntityReviewTable from './entity-review-table';
import { ImportSummaryCard } from './ImportSummaryCard';
import {
  getCategoryColumns,
  getItemColumns,
  getSizeColumns,
  getModifierGroupColumns,
  getModifierColumns,
} from './columns';

interface ImportReviewModuleProps {
  session: ImportSession;
  onSaveDraft: (data: any) => void;
  isUpdating: boolean;
}

const HIGHLIGHT_DURATION_MS = 4000;

export default function ImportReviewModule({
  session,
  onSaveDraft,
  isUpdating,
}: ImportReviewModuleProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'categories' | 'items' | 'sizes' | 'groups' | 'modifiers'
  >('categories');
  const [editedData, setEditedData] = useState(session.parsedData);
  const [highlightRowIndex, setHighlightRowIndex] = useState<number | null>(
    null,
  );
  const [highlightTabKey, setHighlightTabKey] = useState<
    typeof activeTab | null
  >(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setEditedData(session.parsedData);
  }, [session.parsedData]);

  const errors = session.validationErrors ?? [];
  const warnings = session.validationWarnings ?? [];
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  const [detailsVisible, setDetailsVisible] = useState(hasErrors || hasWarnings);

  const getRowErrors = (entity: string, index: number) => {
    return errors.filter(
      (err) => err.entity === entity && err.row === index + 2,
    );
  };

  const getRowWarnings = (entity: string, index: number) => {
    return warnings.filter(
      (warn) => warn.entity === entity && warn.row === index + 2,
    );
  };

  const displayMessage = (err: { field?: string; message: string }) =>
    err.message;

  const entityToTabKey = (entity: string): typeof activeTab => {
    const map: Record<string, typeof activeTab> = {
      Category: 'categories',
      Item: 'items',
      ItemSize: 'sizes',
      ModifierGroup: 'groups',
      Modifier: 'modifiers',
    };
    return map[entity] ?? 'categories';
  };

  const goToError = (entity: string, csvRow: number) => {
    const tab = entityToTabKey(entity);
    const tableIndex = Math.max(0, csvRow - 2);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setActiveTab(tab);
    setHighlightTabKey(tab);
    setHighlightRowIndex(tableIndex);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightRowIndex(null);
      setHighlightTabKey(null);
      highlightTimeoutRef.current = null;
    }, HIGHLIGHT_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, []);



  const updateData = (
    entity: keyof typeof editedData,
    index: number,
    field: string,
    value: any,
  ) => {
    const newData = { ...editedData };
    (newData[entity] as any[])[index] = {
      ...(newData[entity] as any[])[index],
      [field]: value,
    };
    setEditedData(newData);
  };

  const removeData = (entity: keyof typeof editedData, index: number) => {
    const newData = { ...editedData };
    // @ts-ignore
    newData[entity].splice(index, 1);
    setEditedData(newData);
  };

  const addData = (entity: keyof typeof editedData) => {
    const newData = { ...editedData };
    // @ts-ignore
    if (!newData[entity]) newData[entity] = [];

    let newItem: any = { is_active: true };

    if (entity === 'items') {
      newItem = {
        name: '',
        is_active: true,
        sort_order: 0,
      };
    } else if (entity === 'categories') {
      newItem = { name: '', is_active: true, sort_order: 0 };
    } else if (entity === 'modifierGroups') {
      newItem = {
        name: '',
        min_select: 0,
        max_select: 1,
        is_active: true,
        display_type: 'CHECKBOX',
        sort_order: 0,
      };
    } else if (entity === 'modifiers') {
      newItem = { name: '', is_active: true, display_order: 0 };
    } else if (entity === 'itemSizes') {
      newItem = {
        name: '',
        size_code: '',
        display_order: 0,
        is_active: true,
      };
    }

    // @ts-ignore
    newData[entity].push(newItem);
    setEditedData(newData);
  };

  const handleSave = () => {
    onSaveDraft(editedData);
  };

  // Shared props for columns getters
  const columnProps = {
    t,
    updateData,
    removeData,
    getRowErrors,
    getRowWarnings,
  };

  const tabs = [
    {
      key: 'categories',
      label: t('common:categories'),
      count: editedData.categories?.length || 0,
    },
    {
      key: 'items',
      label: t('common:items'),
      count: editedData.items?.length ?? 0,
    },
    {
      key: 'sizes',
      label: t('common:sizes'),
      count: editedData.itemSizes?.length ?? 0,
    },
    {
      key: 'groups',
      label: t('common:modifier-groups'),
      count: editedData.modifierGroups?.length ?? 0,
    },
    {
      key: 'modifiers',
      label: t('common:modifiers'),
      count: editedData.modifiers?.length ?? 0,
    },
  ];

  const getActiveData = () => {
    const map: Record<string, any[]> = {
      categories: editedData.categories || [],
      items: editedData.items || [],
      sizes: editedData.itemSizes || [],
      groups: editedData.modifierGroups || [],
      modifiers: editedData.modifiers || [],
    };
    return map[activeTab] || [];
  };

  const activeData = getActiveData();
  const isEmpty = !activeData.length;

  return (
    <div className="space-y-6">
      {!hasErrors && !hasWarnings && (
        <ImportSummaryCard
          counts={{
            categories: editedData.categories?.length || 0,
            items: editedData.items?.length || 0,
            sizes: editedData.itemSizes?.length || 0,
            modifierGroups: editedData.modifierGroups?.length || 0,
            modifiers: editedData.modifiers?.length || 0,
          }}
          onSave={handleSave}
          isSaving={isUpdating}
          detailsVisible={detailsVisible}
          onToggleDetails={() => setDetailsVisible((v) => !v)}
        />
      )}

      {detailsVisible && (
        <Card className="border border-border-200 shadow-sm bg-light">
      {/* Errors & Warnings list */}
      {(hasErrors || hasWarnings) && (
        <div className="mb-6 space-y-4">
          {hasErrors && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800 p-4">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                {errors.length} {t('common:errors')} —{' '}
                {t('common:import-error-locations')}
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {errors.map((err, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-start gap-2 text-sm"
                  >
                    <span className="font-medium text-heading shrink-0">
                      {err.entity} · {t('common:row')} {err.row}
                      {err.file ? ` · ${err.file}` : ''}
                    </span>
                    <span className="text-red-700 dark:text-red-400">
                      {displayMessage(err)}
                      {err.value !== undefined && err.value !== ''
                        ? ` (${String(err.value)})`
                        : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToError(err.entity, err.row)}
                      className="text-accent hover:text-accent-hover font-medium shrink-0"
                    >
                      → {t('common:go-to-tab')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasWarnings && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800 p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                {warnings.length} {t('common:warnings')}
              </h3>
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {warnings.map((warn, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-start gap-2 text-sm"
                  >
                    <span className="font-medium text-heading shrink-0">
                      {warn.entity} · {t('common:row')} {warn.row}
                      {warn.file ? ` · ${warn.file}` : ''}
                    </span>
                    <span className="text-amber-800 dark:text-amber-200">
                      {displayMessage(warn)}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToError(warn.entity, warn.row)}
                      className="text-accent hover:text-accent-hover font-medium shrink-0"
                    >
                      → {t('common:go-to-tab')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-border-200">
          <nav
            className="-mb-px flex gap-1 overflow-x-auto scrollbar-thin pb-px"
            aria-label="Import data tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  shrink-0 whitespace-nowrap border-b-2 py-3 px-3 text-sm font-semibold rounded-t-md transition-colors
                  ${
                    activeTab === tab.key
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-transparent text-body hover:text-heading hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[120px]">
        {activeTab === 'categories' && (
          <EntityReviewTable
            columns={getCategoryColumns(columnProps)}
            data={editedData.categories || []}
            rowKeyPrefix="category"
            isEmpty={isEmpty}
            entityNameLabel={t('common:categories')}
            highlightTabKey={highlightTabKey}
            highlightRowIndex={highlightRowIndex}
            currentTabKey="categories"
            scrollX={1000}
          />
        )}

        {activeTab === 'items' && (
          <EntityReviewTable
            columns={getItemColumns(columnProps)}
            data={editedData.items || []}
            rowKeyPrefix="item"
            isEmpty={isEmpty}
            entityNameLabel={t('common:items')}
            highlightTabKey={highlightTabKey}
            highlightRowIndex={highlightRowIndex}
            currentTabKey="items"
            scrollX={1200}
          />
        )}

        {activeTab === 'sizes' && (
          <EntityReviewTable
            columns={getSizeColumns(columnProps)}
            data={editedData.itemSizes || []}
            rowKeyPrefix="size"
            isEmpty={isEmpty}
            entityNameLabel={t('common:sizes')}
            highlightTabKey={highlightTabKey}
            highlightRowIndex={highlightRowIndex}
            currentTabKey="sizes"
            scrollX={1000}
          />
        )}

        {activeTab === 'groups' && (
          <EntityReviewTable
            columns={getModifierGroupColumns(columnProps)}
            data={editedData.modifierGroups || []}
            rowKeyPrefix="group"
            isEmpty={isEmpty}
            entityNameLabel={t('common:modifier-groups')}
            highlightTabKey={highlightTabKey}
            highlightRowIndex={highlightRowIndex}
            currentTabKey="groups"
            scrollX={1000}
          />
        )}

        {activeTab === 'modifiers' && (
          <EntityReviewTable
            columns={getModifierColumns(columnProps)}
            data={editedData.modifiers || []}
            rowKeyPrefix="modifier"
            isEmpty={isEmpty}
            entityNameLabel={t('common:modifiers')}
            highlightTabKey={highlightTabKey}
            highlightRowIndex={highlightRowIndex}
            currentTabKey="modifiers"
            scrollX={1000}
          />
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <Button
          variant="outline"
          onClick={() => {
            const map: any = {
              categories: 'categories',
              items: 'items',
              sizes: 'itemSizes',
              groups: 'modifierGroups',
              modifiers: 'modifiers',
            };
            addData(map[activeTab]);
          }}
          className="w-full sm:w-auto border-dashed border-border-200 text-heading font-medium hover:border-accent hover:text-accent hover:bg-accent/5"
        >
          <PlusIcon className="mr-2 h-4 w-4 shrink-0" /> {t('common:add-row')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          loading={isUpdating}
          className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white border-0 font-semibold"
        >
          {t('common:save-changes')}
        </Button>
      </div>
    </Card>
      )}
    </div>
  );
}
