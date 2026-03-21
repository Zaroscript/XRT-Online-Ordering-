import Input from '@/components/ui/input';
import { TrashIcon } from '@/components/icons/trash';
import StatusCell from '../status-cell';

export const getSizeColumns = ({
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
      const errors = getRowErrors('ItemSize', index);
      const warnings = getRowWarnings('ItemSize', index);
      return <StatusCell errors={errors} warnings={warnings} />;
    },
  },
  {
    title: t('common:size-code'),
    dataIndex: 'size_code',
    key: 'size_code',
    width: 120,
    render: (value: string, _: any, index: number) => (
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
    render: (value: string, _: any, index: number) => (
      <Input
        name={`size_name_${index}`}
        value={value || ''}
        onChange={(e) => updateData('itemSizes', index, 'name', e.target.value)}
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
