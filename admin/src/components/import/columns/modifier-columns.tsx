import Input from '@/components/ui/input';
import { TrashIcon } from '@/components/icons/trash';
import StatusCell from '../status-cell';

export const getModifierColumns = ({
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
      const errors = getRowErrors('Modifier', index);
      const warnings = getRowWarnings('Modifier', index);
      return <StatusCell errors={errors} warnings={warnings} />;
    },
  },
  {
    title: t('common:group-key'),
    dataIndex: 'group_key',
    key: 'group_key',
    width: 150,
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
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
    render: (value: boolean, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
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
    render: (value: boolean, _: any, index: number) => (
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
