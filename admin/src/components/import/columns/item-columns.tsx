import Input from '@/components/ui/input';
import { TrashIcon } from '@/components/icons/trash';
import StatusCell from '../status-cell';

export const getItemColumns = ({
  t,
  updateData,
  removeData,
  getRowErrors,
  getRowWarnings,
}: any) => [
  {
    title: t('common:status'),
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (_: any, __: any, index: number) => {
      const errors = getRowErrors('Item', index);
      const warnings = getRowWarnings('Item', index);
      return <StatusCell errors={errors} warnings={warnings} />;
    },
  },
  {
    title: t('common:name'),
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
      <Input
        name={`item_sort_order_${index}`}
        type="number"
        value={value || 0}
        onChange={(e) =>
          updateData('items', index, 'sort_order', parseInt(e.target.value) || 0)
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
    render: (value: boolean, _: any, index: number) => (
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
