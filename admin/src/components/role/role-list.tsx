import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { SortOrder, Role, MappedPaginatorInfo } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { NoDataFound } from '@/components/icons/no-data-found';
import { Routes } from '@/config/routes';

type IProps = {
  roles: Role[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const RoleList = ({
  roles,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: any | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

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
          title={t('table:table-item-title')}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'displayName'
          }
          isActive={sortingObj.column === 'displayName'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'displayName',
      key: 'displayName',
      align: alignLeft,
      width: 200,
      onHeaderCell: () => onHeaderClick('displayName'),
      render: (displayName: string) => (
        <span className="whitespace-nowrap font-medium">{displayName}</span>
      ),
    },
    {
      title: t('common:text-permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      align: alignLeft,
      width: 150,
      render: (permissions: string[]) => (
        <span>{permissions?.length || 0} permissions</span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: '_id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (id: string, record: Role) => {
        if (record.isSystem) return null;
        return (
          <ActionButtons
            id={id}
            editUrl={`${Routes.role.list}/${id}/edit`}
            deleteModalView="DELETE_ROLE"
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
          data={roles}
          rowKey="_id"
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

export default RoleList;
