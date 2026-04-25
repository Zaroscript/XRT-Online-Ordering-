import { Table } from '@/components/ui/table';
import { useLoyaltyTransactionsQuery, useLoyaltyProgramQuery } from '@/data/loyalty';
import { LoyaltyTransaction } from '@/types';
import { useTranslation } from 'next-i18next';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import Pagination from '@/components/ui/pagination';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

export default function LoyaltyTransactionsList({ accountId }: { accountId: string }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { program } = useLoyaltyProgramQuery();
  const redeemRate = program?.redeem_rate_currency_per_point || 0;

  const { transactions, paginatorInfo, loading, error } = useLoyaltyTransactionsQuery({
    id: accountId,
    page,
    limit: 10,
  });

  const columns = useMemo(
    () => [
      {
        title: t('table:table-item-type', 'Type'),
        dataIndex: 'type',
        key: 'type',
        align: 'center',
        render: (type: string) => (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            type === 'EARN' ? 'bg-green-100 text-green-800' :
            type === 'REDEEM' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {type}
          </span>
        ),
      },
      {
        title: t('table:table-item-points', 'Points'),
        dataIndex: 'points_change',
        key: 'points_change',
        align: 'center',
        render: (points: number) => {
          const value = Math.abs(points) * redeemRate;
          return (
            <div className="flex flex-col">
              <span className={`font-semibold ${points > 0 ? 'text-accent' : 'text-red-500'}`}>
                {points > 0 ? `+${points}` : points}
              </span>
              <span className="text-[10px] text-body opacity-70">
                (${value.toFixed(2)})
              </span>
            </div>
          );
        },
      },
      {
        title: t('table:table-item-balance', 'Balance After'),
        dataIndex: 'points_balance_after',
        key: 'points_balance_after',
        align: 'center',
      },
      {
        title: t('table:table-item-description', 'Description'),
        dataIndex: 'description',
        key: 'description',
        align: 'left',
      },
      {
        title: t('table:table-item-date', 'Date'),
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        render: (date: string) => (
          <span className="whitespace-nowrap">{dayjs(date).format('DD MMM YYYY, HH:mm')}</span>
        ),
      },
    ],
    [t, redeemRate]
  );

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="overflow-hidden rounded shadow border border-gray-100">
        <Table
          columns={columns as any}
          emptyText={t('table:empty-table-data')}
          data={transactions || []}
          rowKey="id"
          scroll={{ x: 500 }}
        />
      </div>
      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end mt-4">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}
