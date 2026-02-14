import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge/badge';
import { ImportSession } from '@/data/client/import';
import Button from '@/components/ui/button';
import { TrashIcon } from '@/components/icons/trash';
import { PlusIcon } from '@/components/icons/plus-icon';

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

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

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

  const categoriesColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('Category', index);
        const warnings = getRowWarnings('Category', index);
        if (errors.length > 0)
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={errors.map((e) => e.message).join(' · ')}>
                <Badge text={t('common:error')} color="bg-red-500" />
              </span>
              <span
                className="text-xs text-red-600 dark:text-red-400 truncate"
                title={errors.map((e) => e.message).join(' · ')}
              >
                {displayMessage(errors[0])}
              </span>
            </div>
          );
        if (warnings.length > 0)
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={warnings.map((w) => w.message).join(' · ')}>
                <Badge text={t('common:warning')} color="bg-amber-500" />
              </span>
              <span
                className="text-xs text-amber-700 dark:text-amber-300 truncate"
                title={warnings.map((w) => w.message).join(' · ')}
              >
                {displayMessage(warnings[0])}
              </span>
            </div>
          );
        return <Badge text={t('common:valid')} color="bg-accent" />;
      },
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`category_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('categories' as any, index, 'name', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:description'),
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`category_description_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData(
              'categories' as any,
              index,
              'description',
              e.target.value,
            )
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:sort-order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`category_sort_order_${index}`}
          type="number"
          value={value || 0}
          onChange={(e) =>
            updateData(
              'categories' as any,
              index,
              'sort_order',
              parseInt(e.target.value) || 0,
            )
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:kitchen-section'),
      dataIndex: 'kitchen_section_name',
      key: 'kitchen_section_name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`category_kitchen_section_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData(
              'categories' as any,
              index,
              'kitchen_section_name',
              e.target.value,
            )
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value !== false}
            onChange={(e) =>
              updateData(
                'categories' as any,
                index,
                'is_active',
                e.target.checked,
              )
            }
            className="h-4 w-4 rounded border-border-200 text-accent focus:ring-accent"
          />
        </div>
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <div className="flex justify-center">
          <button
            onClick={() => removeData('categories', index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const itemsColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('Item', index);
        const warnings = getRowWarnings('Item', index);
        if (errors.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={errors.map((e) => e.message).join(' · ')}>
                <Badge text={t('common:error')} color="bg-red-500" />
              </span>
              <span
                className="text-xs text-red-600 dark:text-red-400 truncate"
                title={errors.map((e) => e.message).join(' · ')}
              >
                {displayMessage(errors[0])}
              </span>
            </div>
          );
        }
        if (warnings.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={warnings.map((w) => w.message).join(' · ')}>
                <Badge text={t('common:warning')} color="bg-amber-500" />
              </span>
              <span
                className="text-xs text-amber-700 dark:text-amber-300 truncate"
                title={warnings.map((w) => w.message).join(' · ')}
              >
                {displayMessage(warnings[0])}
              </span>
            </div>
          );
        }
        return <Badge text={t('common:valid')} color="bg-accent" />;
      },
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`item_name_${index}`}
          value={value || ''}
          onChange={(e) => updateData('items', index, 'name', e.target.value)}
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:category-name'),
      dataIndex: 'category_name',
      key: 'category_name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`item_category_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('items', index, 'category_name', e.target.value)
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:description'),
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`item_description_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('items', index, 'description', e.target.value)
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:sort-order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`item_sort_order_${index}`}
          type="number"
          value={value || 0}
          onChange={(e) =>
            updateData(
              'items',
              index,
              'sort_order',
              parseInt(e.target.value) || 0,
            )
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value !== false}
            onChange={(e) =>
              updateData('items', index, 'is_active', e.target.checked)
            }
            className="h-4 w-4 rounded border-border-200 text-accent focus:ring-accent"
          />
        </div>
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <div className="flex justify-center">
          <button
            onClick={() => removeData('items', index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const sizesColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('ItemSize', index);
        const warnings = getRowWarnings('ItemSize', index);
        if (errors.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={errors.map((e) => e.message).join(' · ')}>
                <Badge text={t('common:error')} color="bg-red-500" />
              </span>
              <span
                className="text-xs text-red-600 dark:text-red-400 truncate"
                title={errors.map((e) => e.message).join(' · ')}
              >
                {displayMessage(errors[0])}
              </span>
            </div>
          );
        }
        if (warnings.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={warnings.map((w) => w.message).join(' · ')}>
                <Badge text={t('common:warning')} color="bg-amber-500" />
              </span>
              <span
                className="text-xs text-amber-700 dark:text-amber-300 truncate"
                title={warnings.map((w) => w.message).join(' · ')}
              >
                {displayMessage(warnings[0])}
              </span>
            </div>
          );
        }
        return <Badge text={t('common:valid')} color="bg-accent" />;
      },
    },
    {
      title: t('common:size-code'),
      dataIndex: 'size_code',
      key: 'size_code',
      width: 120,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`size_code_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('itemSizes', index, 'size_code', e.target.value)
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`size_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('itemSizes', index, 'name', e.target.value)
          }
          className="text-sm"
        />
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <div className="flex justify-center">
          <button
            onClick={() => removeData('itemSizes', index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const groupsColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('ModifierGroup', index);
        const warnings = getRowWarnings('ModifierGroup', index);
        if (errors.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={errors.map((e) => e.message).join(' · ')}>
                <Badge text={t('common:error')} color="bg-red-500" />
              </span>
              <span
                className="text-xs text-red-600 dark:text-red-400 truncate"
                title={errors.map((e) => e.message).join(' · ')}
              >
                {displayMessage(errors[0])}
              </span>
            </div>
          );
        }
        if (warnings.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={warnings.map((w) => w.message).join(' · ')}>
                <Badge text={t('common:warning')} color="bg-amber-500" />
              </span>
              <span
                className="text-xs text-amber-700 dark:text-amber-300 truncate"
                title={warnings.map((w) => w.message).join(' · ')}
              >
                {displayMessage(warnings[0])}
              </span>
            </div>
          );
        }
        return <Badge text={t('common:valid')} color="bg-accent" />;
      },
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`group_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifierGroups', index, 'name', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:display-name'),
      dataIndex: 'display_name',
      key: 'display_name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`group_display_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifierGroups', index, 'display_name', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:display-type'),
      dataIndex: 'display_type',
      key: 'display_type',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <select
          value={value || 'RADIO'}
          onChange={(e) =>
            updateData('modifierGroups', index, 'display_type', e.target.value)
          }
          className="h-9 w-full rounded border border-border-200 bg-light px-3 text-sm font-medium text-heading focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="RADIO">RADIO</option>
          <option value="CHECKBOX">CHECKBOX</option>
        </select>
      ),
    },
    {
      title: t('common:min-select'),
      dataIndex: 'min_select',
      key: 'min_select',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`group_min_select_${index}`}
          type="number"
          value={value || 0}
          onChange={(e) =>
            updateData(
              'modifierGroups',
              index,
              'min_select',
              parseInt(e.target.value) || 0,
            )
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:max-select'),
      dataIndex: 'max_select',
      key: 'max_select',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`group_max_select_${index}`}
          type="number"
          value={value || 1}
          onChange={(e) =>
            updateData(
              'modifierGroups',
              index,
              'max_select',
              parseInt(e.target.value) || 1,
            )
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:sort-order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`group_sort_order_${index}`}
          type="number"
          value={value || 0}
          onChange={(e) =>
            updateData(
              'modifierGroups',
              index,
              'sort_order',
              parseInt(e.target.value) || 0,
            )
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value !== false}
            onChange={(e) =>
              updateData('modifierGroups', index, 'is_active', e.target.checked)
            }
            className="h-4 w-4 rounded border-border-200 text-accent focus:ring-accent"
          />
        </div>
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <div className="flex justify-center">
          <button
            onClick={() => removeData('modifierGroups', index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const modifiersColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('Modifier', index);
        const warnings = getRowWarnings('Modifier', index);
        if (errors.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={errors.map((e) => e.message).join(' · ')}>
                <Badge text={t('common:error')} color="bg-red-500" />
              </span>
              <span
                className="text-xs text-red-600 dark:text-red-400 truncate"
                title={errors.map((e) => e.message).join(' · ')}
              >
                {displayMessage(errors[0])}
              </span>
            </div>
          );
        }
        if (warnings.length > 0) {
          return (
            <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
              <span title={warnings.map((w) => w.message).join(' · ')}>
                <Badge text={t('common:warning')} color="bg-amber-500" />
              </span>
              <span
                className="text-xs text-amber-700 dark:text-amber-300 truncate"
                title={warnings.map((w) => w.message).join(' · ')}
              >
                {displayMessage(warnings[0])}
              </span>
            </div>
          );
        }
        return <Badge text={t('common:valid')} color="bg-accent" />;
      },
    },
    {
      title: t('common:group-key'),
      dataIndex: 'group_key',
      key: 'group_key',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`modifier_group_key_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifiers', index, 'group_key', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:modifier-key'),
      dataIndex: 'modifier_key',
      key: 'modifier_key',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`modifier_key_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifiers', index, 'modifier_key', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`modifier_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifiers', index, 'name', e.target.value)
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:max-quantity'),
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`modifier_max_quantity_${index}`}
          type="number"
          value={value || ''}
          onChange={(e) =>
            updateData(
              'modifiers',
              index,
              'max_quantity',
              parseInt(e.target.value) || undefined,
            )
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:is-default'),
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) =>
              updateData('modifiers', index, 'is_default', e.target.checked)
            }
            className="h-4 w-4 rounded border-border-200 text-accent focus:ring-accent"
          />
        </div>
      ),
    },
    {
      title: t('common:sort-order'),
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`modifier_display_order_${index}`}
          type="number"
          value={value || 0}
          onChange={(e) =>
            updateData(
              'modifiers',
              index,
              'display_order',
              parseInt(e.target.value) || 0,
            )
          }
          className="!text-sm"
        />
      ),
    },
    {
      title: t('common:active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value !== false}
            onChange={(e) =>
              updateData('modifiers', index, 'is_active', e.target.checked)
            }
            className="h-4 w-4 rounded border-border-200 text-accent focus:ring-accent"
          />
        </div>
      ),
    },
    {
      title: t('common:actions'),
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <div className="flex justify-center">
          <button
            onClick={() => removeData('modifiers', index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    {
      key: 'categories',
      label: t('common:categories'),
      count: editedData.categories?.length || 0,
    },
    { key: 'items', label: t('common:items'), count: editedData.items.length },
    {
      key: 'sizes',
      label: t('common:sizes'),
      count: editedData.itemSizes.length,
    },
    {
      key: 'groups',
      label: t('common:modifier-groups'),
      count: editedData.modifierGroups.length,
    },
    {
      key: 'modifiers',
      label: t('common:modifiers'),
      count: editedData.modifiers.length,
    },
  ];

  const getActiveData = () => {
    const map: Record<string, any[]> = {
      categories: editedData.categories || [],
      items: editedData.items,
      sizes: editedData.itemSizes,
      groups: editedData.modifierGroups,
      modifiers: editedData.modifiers,
    };
    return map[activeTab] || [];
  };

  const activeData = getActiveData();
  const isEmpty = !activeData.length;

  return (
    <Card className="border border-border-200 shadow-sm bg-light">
      {/* Errors & Warnings list - show where each error is */}
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
        {activeTab === 'categories' &&
          (isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-heading">
                {t('common:no-rows-in-tab')}
              </p>
              <p className="mt-1 text-xs font-medium text-body">
                {t('common:categories')}
              </p>
            </div>
          ) : (
            <Table
              columns={categoriesColumns}
              data={editedData.categories || []}
              rowKey={(record, index) => `category-${index}`}
              rowClassName={(_, index) =>
                highlightTabKey === 'categories' && highlightRowIndex === index
                  ? '!bg-amber-100 dark:!bg-amber-900/30'
                  : ''
              }
              scroll={{ x: 1000 }}
            />
          ))}
        {activeTab === 'items' &&
          (isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-heading">
                {t('common:no-rows-in-tab')}
              </p>
              <p className="mt-1 text-xs font-medium text-body">
                {t('common:items')}
              </p>
            </div>
          ) : (
            <Table
              columns={itemsColumns}
              data={editedData.items}
              rowKey={(record, index) => `item-${index}`}
              rowClassName={(_, index) =>
                highlightTabKey === 'items' && highlightRowIndex === index
                  ? '!bg-amber-100 dark:!bg-amber-900/30'
                  : ''
              }
              scroll={{ x: 1200 }}
            />
          ))}

        {activeTab === 'sizes' &&
          (isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-heading">
                {t('common:no-rows-in-tab')}
              </p>
              <p className="mt-1 text-xs font-medium text-body">
                {t('common:sizes')}
              </p>
            </div>
          ) : (
            <Table
              columns={sizesColumns}
              data={editedData.itemSizes}
              rowKey={(record, index) => `size-${index}`}
              rowClassName={(_, index) =>
                highlightTabKey === 'sizes' && highlightRowIndex === index
                  ? '!bg-amber-100 dark:!bg-amber-900/30'
                  : ''
              }
              scroll={{ x: 1000 }}
            />
          ))}

        {activeTab === 'groups' &&
          (isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-heading">
                {t('common:no-rows-in-tab')}
              </p>
              <p className="mt-1 text-xs font-medium text-body">
                {t('common:modifier-groups')}
              </p>
            </div>
          ) : (
            <Table
              columns={groupsColumns}
              data={editedData.modifierGroups}
              rowKey={(record, index) => `group-${index}`}
              rowClassName={(_, index) =>
                highlightTabKey === 'groups' && highlightRowIndex === index
                  ? '!bg-amber-100 dark:!bg-amber-900/30'
                  : ''
              }
              scroll={{ x: 1000 }}
            />
          ))}

        {activeTab === 'modifiers' &&
          (isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-heading">
                {t('common:no-rows-in-tab')}
              </p>
              <p className="mt-1 text-xs font-medium text-body">
                {t('common:modifiers')}
              </p>
            </div>
          ) : (
            <Table
              columns={modifiersColumns}
              data={editedData.modifiers}
              rowKey={(record, index) => `modifier-${index}`}
              rowClassName={(_, index) =>
                highlightTabKey === 'modifiers' && highlightRowIndex === index
                  ? '!bg-amber-100 dark:!bg-amber-900/30'
                  : ''
              }
              scroll={{ x: 1000 }}
            />
          ))}
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
  );
}
