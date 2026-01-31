import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge/badge';
import { ImportSession } from '@/data/client/import';
import Button from '@/components/ui/button';

interface ImportReviewModuleProps {
  session: ImportSession;
  onSaveDraft: (data: any) => void;
  isUpdating: boolean;
}

export default function ImportReviewModule({
  session,
  onSaveDraft,
  isUpdating,
}: ImportReviewModuleProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'categories' | 'items' | 'sizes' | 'groups' | 'modifiers' | 'overrides'
  >('categories');
  const [editedData, setEditedData] = useState(session.parsedData);

  useEffect(() => {
    setEditedData(session.parsedData);
  }, [session.parsedData]);

  const getRowErrors = (entity: string, index: number) => {
    return session.validationErrors.filter(
      (err) => err.entity === entity && err.row === index + 2,
    );
  };

  const getRowWarnings = (entity: string, index: number) => {
    return session.validationWarnings.filter(
      (warn) => warn.entity === entity && warn.row === index + 2,
    );
  };

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
          return <Badge text={t('common:error')} color="bg-red-500" />;
        if (warnings.length > 0)
          return <Badge text={t('common:warning')} color="bg-yellow-500" />;
        return <Badge text={t('common:valid')} color="bg-green-500" />;
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
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
          className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
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
          return <Badge text={t('common:error')} color="bg-red-500" />;
        }
        if (warnings.length > 0) {
          return <Badge text={t('common:warning')} color="bg-yellow-500" />;
        }
        return <Badge text={t('common:valid')} color="bg-green-500" />;
      },
    },
    {
      title: t('common:item-key'),
      dataIndex: 'item_key',
      key: 'item_key',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`item_key_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('items', index, 'item_key', e.target.value)
          }
          className="!h-9 !text-sm"
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
          name={`item_name_${index}`}
          value={value || ''}
          onChange={(e) => updateData('items', index, 'name', e.target.value)}
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:base-price'),
      dataIndex: 'base_price',
      key: 'base_price',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`item_base_price_${index}`}
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) =>
            updateData(
              'items',
              index,
              'base_price',
              parseFloat(e.target.value) || 0,
            )
          }
          className="!h-9 !text-sm"
          disabled={record.is_sizeable}
        />
      ),
    },
    {
      title: t('common:is-sizeable'),
      dataIndex: 'is_sizeable',
      key: 'is_sizeable',
      width: 120,
      render: (value: boolean, record: any, index: number) => (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) =>
            updateData('items', index, 'is_sizeable', e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
      ),
    },
    {
      title: t('common:default-size-code'),
      dataIndex: 'default_size_code',
      key: 'default_size_code',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`item_default_size_code_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('items', index, 'default_size_code', e.target.value)
          }
          className="!h-9 !text-sm"
          disabled={!record.is_sizeable}
        />
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
          return <Badge text={t('common:error')} color="bg-red-500" />;
        }
        if (warnings.length > 0) {
          return <Badge text={t('common:warning')} color="bg-yellow-500" />;
        }
        return <Badge text={t('common:valid')} color="bg-green-500" />;
      },
    },
    {
      title: t('common:item-key'),
      dataIndex: 'item_key',
      key: 'item_key',
      width: 150,
      render: (value: string) => <span className="text-sm">{value}</span>,
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`size_price_${index}`}
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) =>
            updateData(
              'itemSizes',
              index,
              'price',
              parseFloat(e.target.value) || 0,
            )
          }
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:is-default'),
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) =>
            updateData('itemSizes', index, 'is_default', e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
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
          return <Badge text={t('common:error')} color="bg-red-500" />;
        }
        if (warnings.length > 0) {
          return <Badge text={t('common:warning')} color="bg-yellow-500" />;
        }
        return <Badge text={t('common:valid')} color="bg-green-500" />;
      },
    },
    {
      title: t('common:group-key'),
      dataIndex: 'group_key',
      key: 'group_key',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          name={`group_key_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifierGroups', index, 'group_key', e.target.value)
          }
          className="!h-9 !text-sm"
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
          name={`group_name_${index}`}
          value={value || ''}
          onChange={(e) =>
            updateData('modifierGroups', index, 'name', e.target.value)
          }
          className="!h-9 !text-sm"
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
          className="h-9 w-full rounded border border-gray-300 px-3 text-sm focus:border-accent focus:outline-none"
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
        />
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
          return <Badge text={t('common:error')} color="bg-red-500" />;
        }
        if (warnings.length > 0) {
          return <Badge text={t('common:warning')} color="bg-yellow-500" />;
        }
        return <Badge text={t('common:valid')} color="bg-green-500" />;
      },
    },
    {
      title: t('common:group-key'),
      dataIndex: 'group_key',
      key: 'group_key',
      width: 150,
      render: (value: string) => <span className="text-sm">{value}</span>,
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
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
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:is-default'),
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) =>
            updateData('modifiers', index, 'is_default', e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
      ),
    },
  ];

  const overridesColumns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: any, index: number) => {
        const errors = getRowErrors('ItemModifierOverride', index);
        if (errors.length > 0) {
          return <Badge text={t('common:error')} color="bg-red-500" />;
        }
        return <Badge text={t('common:valid')} color="bg-green-500" />;
      },
    },
    {
      title: t('common:item-key'),
      dataIndex: 'item_key',
      key: 'item_key',
      width: 150,
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      title: t('common:group-key'),
      dataIndex: 'group_key',
      key: 'group_key',
      width: 150,
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      title: t('common:modifier-key'),
      dataIndex: 'modifier_key',
      key: 'modifier_key',
      width: 150,
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      title: t('common:max-quantity'),
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <Input
          name={`override_max_quantity_${index}`}
          type="number"
          value={value || ''}
          onChange={(e) =>
            updateData(
              'itemModifierOverrides',
              index,
              'max_quantity',
              parseInt(e.target.value) || undefined,
            )
          }
          className="!h-9 !text-sm"
        />
      ),
    },
    {
      title: t('common:is-default'),
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (value: boolean, record: any, index: number) => (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) =>
            updateData(
              'itemModifierOverrides',
              index,
              'is_default',
              e.target.checked,
            )
          }
          className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
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
    {
      key: 'overrides',
      label: t('common:overrides'),
      count: editedData.itemModifierOverrides.length,
    },
  ];

  return (
    <Card>
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${
                    activeTab === tab.key
                      ? 'border-accent text-accent'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="overflow-x-auto">
        {activeTab === 'categories' && (
          <Table
            columns={categoriesColumns}
            data={editedData.categories || []}
            rowKey={(record, index) => `category-${index}`}
            scroll={{ x: 1000 }}
          />
        )}
        {activeTab === 'items' && (
          <Table
            columns={itemsColumns}
            data={editedData.items}
            rowKey={(record, index) => `item-${index}`}
            scroll={{ x: 1200 }}
          />
        )}

        {activeTab === 'sizes' && (
          <Table
            columns={sizesColumns}
            data={editedData.itemSizes}
            rowKey={(record, index) => `size-${index}`}
            scroll={{ x: 1000 }}
          />
        )}

        {activeTab === 'groups' && (
          <Table
            columns={groupsColumns}
            data={editedData.modifierGroups}
            rowKey={(record, index) => `group-${index}`}
            scroll={{ x: 1000 }}
          />
        )}

        {activeTab === 'modifiers' && (
          <Table
            columns={modifiersColumns}
            data={editedData.modifiers}
            rowKey={(record, index) => `modifier-${index}`}
            scroll={{ x: 1000 }}
          />
        )}

        {activeTab === 'overrides' && (
          <Table
            columns={overridesColumns}
            data={editedData.itemModifierOverrides}
            rowKey={(record, index) => `override-${index}`}
            scroll={{ x: 1000 }}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating} loading={isUpdating}>
          {t('common:save-changes')}
        </Button>
      </div>
    </Card>
  );
}
