import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { LoyaltyAccount, PaginatorInfo } from '@/types';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import Button from '@/components/ui/button';
import { Eye } from '@/components/icons/eye-icon';
import { useRouter } from 'next/router';

type IProps = {
  members: LoyaltyAccount[] | null | undefined;
  paginatorInfo: PaginatorInfo<LoyaltyAccount> | null;
  onPagination: (key: number) => void;
};

const LoyaltyMemberList = ({ members, paginatorInfo, onPagination }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        title: t('table:table-item-name', 'Name'),
        dataIndex: 'customer',
        key: 'name',
        align: 'left',
        render: (customer: any, record: LoyaltyAccount) => {
          return (
            <span className="font-semibold text-heading">
              {customer?.name || t('common:text-unknown')}
            </span>
          );
        },
      },
      {
        title: t('table:table-item-phone', 'Phone Number'),
        dataIndex: 'customer',
        key: 'phone',
        align: 'left',
        render: (customer: any, record: LoyaltyAccount) =>
          customer?.phoneNumber || record.phone || '-',
      },
      {
        title: t('table:table-item-email', 'Email'),
        dataIndex: 'customer',
        key: 'email',
        align: 'left',
        render: (customer: any) => customer?.email || '-',
      },
      {
        title: t('table:table-item-points-balance', 'Points Balance'),
        dataIndex: 'points_balance',
        key: 'points_balance',
        align: 'center',
        render: (points: number) => (
          <span className="font-semibold text-accent">{points}</span>
        ),
      },
      {
        title: t('table:table-item-joined', 'Join Date'),
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        render: (date: string) => {
          return <span className="whitespace-nowrap">{dayjs(date).format('DD MMM YYYY')}</span>;
        },
      },
      {
        title: t('table:table-item-last-activity', 'Last Activity'),
        dataIndex: 'last_activity',
        key: 'last_activity',
        align: 'center',
        render: (date: string, record: LoyaltyAccount) => {
          const value = date || record?.customer?.last_activity || record?.customer?.last_order_at;
          if (!value) return '-';
          return <span className="whitespace-nowrap">{dayjs(value).format('DD MMM YYYY')}</span>;
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
    [t, router]
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
