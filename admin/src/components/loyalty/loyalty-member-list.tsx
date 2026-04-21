import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { LoyaltyAccount, PaginatorInfo } from '@/types';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import Button from '@/components/ui/button';
import { Eye } from '@/components/icons/eye-icon';
import { useRouter } from 'next/router';
import { useLoyaltyProgramQuery } from '@/data/loyalty';

type IProps = {
  members: LoyaltyAccount[] | null | undefined;
  paginatorInfo: PaginatorInfo<LoyaltyAccount> | null;
  onPagination: (key: number) => void;
};

const LoyaltyMemberList = ({ members, paginatorInfo, onPagination }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { program } = useLoyaltyProgramQuery();
  const redeemRate = program?.redeem_rate_currency_per_point || 0;

  const columns = useMemo(
    () => [
      {
        title: t('table:table-item-customer', 'Customer'),
        dataIndex: 'customer',
        key: 'customer',
        align: 'left',
        render: (customer: any, record: LoyaltyAccount) => {
          const name = customer?.name || record.phone || t('common:text-unknown');
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-heading">{name}</span>
              <span className="text-sm text-body">{customer?.email || record.phone}</span>
            </div>
          );
        },
      },
      {
        title: t('table:table-item-points-balance', 'Balance'),
        dataIndex: 'points_balance',
        key: 'points_balance',
        align: 'center',
        render: (points: number) => (
          <span className="font-semibold text-accent">{points}</span>
        ),
      },
      {
        title: t('table:table-item-total-earned', 'Total Earned'),
        dataIndex: 'total_points_earned',
        key: 'total_points_earned',
        align: 'center',
      },
      {
        title: t('table:table-item-total-redeemed', 'Total Redeemed'),
        dataIndex: 'total_points_redeemed',
        key: 'total_points_redeemed',
        align: 'center',
      },
      {
        title: t('table:table-item-redeemed-value', 'Redeemed Value'),
        dataIndex: 'total_points_redeemed',
        key: 'redeemed_value',
        align: 'center',
        render: (points: number) => {
          const value = points * redeemRate;
          return <span className="font-semibold text-accent">${value.toFixed(2)}</span>;
        },
      },
      {
        title: t('table:table-item-joined', 'Joined At'),
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        render: (date: string) => {
          return <span className="whitespace-nowrap">{dayjs(date).format('DD MMM YYYY')}</span>;
        },
      },
      {
        title: t('table:table-item-actions', 'Actions'),
        dataIndex: 'id',
        key: 'actions',
        align: 'center',
        render: (id: string) => (
          <Button
            variant="outline"
            className="text-accent hover:text-accent-hover focus:outline-none"
            onClick={() => router.push(`/loyalty/members/${id}`)}
            title={t('common:text-view-details', 'View Details')}
          >
            <Eye width={20} />
          </Button>
        ),
      },
    ],
    [t, router, redeemRate]
  );

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          columns={columns as any}
          emptyText={t('table:empty-table-data')}
          data={members || []}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.current_page}
            pageSize={paginatorInfo.per_page}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default LoyaltyMemberList;
