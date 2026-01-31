import { Table } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  PriceChangeHistory,
  useRollbackPriceUpdateMutation,
  useDeletePriceHistoryMutation,
  useClearPriceHistoryMutation,
} from '@/data/price-update';
import Pagination from '@/components/ui/pagination';
import dayjs from 'dayjs';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import { useState } from 'react';
import Modal from '@/components/ui/modal/modal';
import ConfirmationCard from '@/components/common/confirmation-card';
import { TrashIcon } from '@/components/icons/trash';

export type PriceUpdateHistoryTableProps = {
  history: PriceChangeHistory[];
  paginatorInfo: any;
  onPagination: (current: number) => void;
};

export default function PriceUpdateHistoryTable({
  history,
  paginatorInfo,
  onPagination,
}: PriceUpdateHistoryTableProps) {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const { mutate: rollback, isPending: isRollbackLoading } =
    useRollbackPriceUpdateMutation();
  const { mutate: deleteHistory, isPending: isDeleteLoading } =
    useDeletePriceHistoryMutation();
  const { mutate: clearHistory, isPending: isClearLoading } =
    useClearPriceHistoryMutation();
  const [rollbackId, setRollbackId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRollback = () => {
    if (rollbackId) {
      rollback(
        { id: rollbackId },
        {
          onSuccess: () => setRollbackId(null),
        },
      );
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteHistory(
        { id: deleteId },
        {
          onSuccess: () => setDeleteId(null),
        },
      );
    }
  };

  const handleClearAll = () => {
    clearHistory(undefined, {
      onSuccess: () => setShowClearConfirm(false),
    });
  };

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 130,
      render: (id: string) => (
        <span className="truncate whitespace-nowrap">
          #{id.substring(id.length - 6).toUpperCase()}
        </span>
      ),
    },
    {
      title: t('table:table-item-date'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: alignLeft,
      width: 200,
      render: (date: string) => dayjs(date).format('MMM D, YYYY h:mm A'),
    },
    {
      title: t('form:input-label-target'),
      dataIndex: 'target',
      key: 'target',
      align: alignLeft,
      width: 120,
      render: (target: string) => (
        <span>
          {target
            ? t(`form:input-label-${target.toLowerCase()}`)
            : t('form:input-label-items')}
        </span>
      ),
    },
    {
      title: t('table:table-item-operation'),
      dataIndex: 'type',
      key: 'type',
      align: alignLeft,
      width: 150,
      render: (type: string, record: PriceChangeHistory) => {
        const isIncrease = type === 'INCREASE';
        const prefix = isIncrease ? '+' : '-';
        const colorClass = isIncrease ? 'text-green-600' : 'text-red-500';
        const bgClass = isIncrease ? 'bg-green-50' : 'bg-red-50';
        const valueDisplay =
          record.value_type === 'PERCENTAGE'
            ? `${record.value}%`
            : `$${record.value}`;

        return (
          <div
            className={`inline-flex flex-col items-start px-3 py-1.5 rounded-lg ${bgClass}`}
          >
            <span className={`font-semibold text-sm ${colorClass}`}>
              {isIncrease ? 'Increase' : 'Decrease'}
            </span>
            <span className={`text-base font-bold ${colorClass}`}>
              {prefix}
              {valueDisplay}
            </span>
          </div>
        );
      },
    },
    {
      title: t('table:table-item-admin'),
      dataIndex: 'admin_id',
      key: 'admin_id',
      align: alignLeft,
      width: 150,
    },
    {
      title: t('table:table-item-affected-items'),
      dataIndex: 'affected_items_count',
      key: 'affected_items_count',
      align: 'center',
      width: 120,
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status: string) => {
        let color = 'bg-gray-400';
        if (status === 'COMPLETED') color = 'bg-accent';
        if (status === 'ROLLED_BACK') color = 'bg-yellow-500';
        if (status === 'FAILED') color = 'bg-red-500';

        return <Badge text={status} color={color} />;
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (id: string, record: PriceChangeHistory) => {
        return (
          <div className="flex items-center gap-2 justify-end">
            {record.status !== 'ROLLED_BACK' && record.status !== 'FAILED' && (
              <Button
                size="small"
                variant="outline"
                onClick={() => setRollbackId(id)}
                disabled={isRollbackLoading}
              >
                {t('common:text-rollback')}
              </Button>
            )}
            <button
              onClick={() => setDeleteId(id)}
              className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
              title={t('common:text-delete')}
            >
              <TrashIcon width={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Clear History Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 hover:shadow-md transition-all duration-300"
          onClick={() => setShowClearConfirm(true)}
          disabled={isClearLoading || history.length === 0}
        >
          {t('common:text-clear-history')}
        </Button>
      </div>
      <div className="rounded overflow-hidden shadow mb-6">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={history}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {!!paginatorInfo.total && (
        <div className="flex justify-end items-center">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}

      {/* Confirmation Modal for Rollback */}
      <Modal open={!!rollbackId} onClose={() => setRollbackId(null)}>
        <ConfirmationCard
          onCancel={() => setRollbackId(null)}
          onDelete={handleRollback}
          title="rollback-confirmation-title"
          description="rollback-confirmation-description"
          deleteBtnText="text-confirm-rollback"
          deleteBtnLoading={isRollbackLoading}
        />
      </Modal>

      {/* Confirmation Modal for Delete */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <ConfirmationCard
          onCancel={() => setDeleteId(null)}
          onDelete={handleDelete}
          title="delete-confirmation-title"
          description="delete-confirmation-description"
          deleteBtnLoading={isDeleteLoading}
        />
      </Modal>

      {/* Confirmation Modal for Clear All */}
      <Modal open={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <ConfirmationCard
          onCancel={() => setShowClearConfirm(false)}
          onDelete={handleClearAll}
          title="clear-history-confirmation-title"
          description="clear-history-confirmation-description"
          deleteBtnText="text-clear-all"
          deleteBtnLoading={isClearLoading}
        />
      </Modal>
    </>
  );
}
