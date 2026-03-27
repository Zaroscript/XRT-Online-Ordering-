import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';

interface EntityReviewTableProps {
  columns: any[];
  data: any[];
  rowKeyPrefix: string;
  isEmpty: boolean;
  emptyIcon?: React.ReactNode;
  entityNameLabel: string;
  highlightTabKey: string | null;
  highlightRowIndex: number | null;
  currentTabKey: string;
  scrollX?: number;
}

export default function EntityReviewTable({
  columns,
  data,
  rowKeyPrefix,
  isEmpty,
  entityNameLabel,
  highlightTabKey,
  highlightRowIndex,
  currentTabKey,
  scrollX = 1000,
}: EntityReviewTableProps) {
  const { t } = useTranslation();

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-sm font-semibold text-heading">
          {t('common:no-rows-in-tab')}
        </p>
        <p className="mt-1 text-xs font-medium text-body">
          {entityNameLabel}
        </p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      data={data || []}
      rowKey={(_, index) => `${rowKeyPrefix}-${index}`}
      rowClassName={(_, index) =>
        highlightTabKey === currentTabKey && highlightRowIndex === index
          ? '!bg-amber-100 dark:!bg-amber-900/30'
          : ''
      }
      scroll={{ x: scrollX }}
    />
  );
}
