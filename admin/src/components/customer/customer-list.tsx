import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { Routes } from '@/config/routes';
import {
  SortOrder,
} from '@/types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import { format } from 'date-fns';
import { IProps } from './types';



const CustomerList = ({
  customers,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: any | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const getRewardsBadgeColor = (points: number) => {
    if (points >= 500) return 'bg-amber-100 !text-amber-800';
    if (points >= 100) return 'bg-emerald-100 !text-emerald-800';
    if (points >= 1) return 'bg-red-100 !text-red-700';
    return 'bg-gray-100 !text-gray-600';
  };

  const onHeaderClick = (column: any | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc
          ? SortOrder.Asc
          : SortOrder.Desc,
      );

      onOrder(column);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });


  const columns = [
    {
      title: (
        <TitleWithSort
          title="Email"
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'email'
          }
          isActive={sortingObj.column === 'email'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'email',
      key: 'email',
      align: alignLeft,
      width: 200,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('email'),
      render: (email: string) => (
        <span className="font-medium text-sm">{email}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title="Name"
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
          }
          isActive={sortingObj.column === 'name'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 180,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: (name: string) => (
        <span className="font-medium text-sm">{name}</span>
      ),
    },
    {
      title: "Phone",
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      align: alignLeft,
      width: 150,
      render: (phone: string) => (
        <span className="text-sm">{phone || 'N/A'}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title="Last Order"
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'last_order_at'
          }
          isActive={sortingObj.column === 'last_order_at'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'last_order_at',
      key: 'last_order_at',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('last_order_at'),
      render: (lastOrderAt: string | null) => (
        <span className="text-sm">
          {lastOrderAt
            ? format(new Date(lastOrderAt), 'MMM dd, yyyy')
            : 'No orders'}
        </span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title="Rewards"
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'loyaltyPoints'
          }
          isActive={sortingObj.column === 'loyaltyPoints'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('loyaltyPoints'),
      render: (loyaltyPoints: number, record: any) => {
        const points = Number.isFinite(Number(loyaltyPoints))
          ? Number(loyaltyPoints)
          : Number(record?.rewards || 0);
        return (
          <span title="Current loyalty balance">
        <Badge
              text={`${points} points`}
              color={getRewardsBadgeColor(points)}
        />
          </span>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(_id: string | undefined, record: any) {
        const customerId = record?._id || record?.id || _id;
        if (!customerId) {
          return null;
        }
        return (
          <ActionButtons
            id={customerId}
            deleteModalView="DELETE_CUSTOMER"
            editUrl={Routes.customer.edit(customerId, locale || 'en')}
            data={{
              customer_name: String(record?.name || ''),
            }}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={customers as any}
          rowKey={(record: any) => record._id || record.id || ''}
          scroll={{ x: 800 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default CustomerList;
