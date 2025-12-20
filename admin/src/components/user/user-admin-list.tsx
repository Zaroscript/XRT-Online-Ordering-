import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { siteSettings } from '@/settings/site.settings';
import { Routes } from '@/config/routes';
import {
  Category,
  MappedPaginatorInfo,
  SortOrder,
  User,
  UserPaginator,
} from '@/types';
import { useMeQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import { NoDataFound } from '@/components/icons/no-data-found';
import TitleWithSort from '@/components/ui/title-with-sort';
import Badge from '../ui/badge/badge';
import Avatar from '../common/avatar';
import { useModalAction } from '@/components/ui/modal/modal.context';

type IProps = {
  admins: User[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};
const AdminsList = ({
  admins,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const { openModal } = useModalAction();

  // Filter out super_admin
  // @ts-ignore
  const filteredAdmins = admins?.filter(
    (admin: any) => admin.role !== 'super_admin',
  ) ?? [];



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

  const { data: me } = useMeQuery();

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
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
      width: 250,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: (
        name: string,
        { profile, email }: { profile: any; email: string },
      ) => (
        <div className="flex items-center">
          <Avatar name={name} src={profile?.avatar?.thumbnail} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {name}
            <span className="text-[13px] font-normal text-gray-500/80">
              {email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-permissions'),
      dataIndex: 'id',
      key: 'permissions',
      align: alignLeft,
      width: 150,
      render: (id: string) => {
        return (
          <button
            onClick={() => openModal('ADMIN_PERMISSIONS_VIEW', id)}
            className="text-accent transition-colors hover:text-accent-hover focus:outline-none bg-transparent border border-accent rounded px-3 py-1 cursor-pointer"
          >
            {t('common:text-view-permissions')}
          </button>
        );
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: function Render(id: string, { is_active }: any) {
        return (
          <>
            {me?.id != id && (
              <ActionButtons
                id={id}
                userStatus={false}
                isUserActive={is_active}
                showAddWalletPoints={false}
                showMakeAdminButton={true}
                deleteModalView="DELETE_USER"
                editUrl={Routes.user.editByIdWithoutLang(id)}
              />
            )}
          </>
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
          data={filteredAdmins as { profile: any; email: string }[] | undefined}
          rowKey="id"
          scroll={{ x: 1000 }}
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

export default AdminsList;
