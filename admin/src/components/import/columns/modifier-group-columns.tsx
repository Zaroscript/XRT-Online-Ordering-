import Input from '@/components/ui/input';
import { TrashIcon } from '@/components/icons/trash';
import StatusCell from '../status-cell';

export const getModifierGroupColumns = ({
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
      const errors = getRowErrors('ModifierGroup', index);
      const warnings = getRowWarnings('ModifierGroup', index);
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
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
    render: (value: number, _: any, index: number) => (
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
    render: (value: boolean, _: any, index: number) => (
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
