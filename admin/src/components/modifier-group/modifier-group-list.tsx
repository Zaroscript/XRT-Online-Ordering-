import React, { useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { ModifierGroup, Modifier, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { Switch } from '@headlessui/react';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';
import {
  ResponsiveCard,
  CardHeader,
  CardTitle,
  CardBadge,
  CardContent,
  CardRow,
  CardActions,
} from '@/components/ui/responsive-card';
import { ModifierGroupListSkeleton } from '@/components/ui/loading-skeleton';

export type IProps = {
  groups: ModifierGroup[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
  isLoading?: boolean;
};

const ModifierGroupList = ({
  groups,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
  isLoading = false,
}: IProps) => {
  const { t } = useTranslation(['common', 'form', 'table']);
  const { openModal } = useModalAction();
  const { isOpen } = useModalState();
  const router = useRouter();
  const { locale } = router;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDeletingId(null);
      setTogglingId(null);
    }
  }, [isOpen]);

  const { alignLeft, alignRight } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const { permissions, role } = getAuthCredentials();
  const canUpdate = role === 'super_admin' || hasPermission(['modifier_groups:update'], permissions);
  const canDelete = role === 'super_admin' || hasPermission(['modifier_groups:delete'], permissions);

  // Show skeleton when loading
  if (isLoading) {
    return <ModifierGroupListSkeleton />;
  }

  // Show empty state
  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 bg-white rounded-lg shadow">
        <NoDataFound className="w-52" />
        <div className="mb-1 pt-6 text-base font-semibold text-heading">
          {t('table:empty-table-data')}
        </div>
        <p className="text-[13px] text-body">{t('table:empty-table-sorry-text')}</p>
      </div>
    );
  }

  const handleRowClick = (group: ModifierGroup) => {
    router.push(Routes.modifierGroup.details(group.id)).catch((err) => {
      console.error('Navigation error:', err);
      window.location.href = Routes.modifierGroup.details(group.id);
    });
  };

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
      width: 200,
      onHeaderCell: () => onHeaderClick('name'),
      render: (name: string, record: ModifierGroup) => (
        <Link
          href={`/modifiers/groups/${record.id}`}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
          className="font-medium text-heading hover:text-accent transition-colors cursor-pointer"
        >
          {name}
        </Link>
      ),
    },
    {
      title: t('form:input-label-display-type') || 'Display Type',
      dataIndex: 'display_type',
      key: 'display_type',
      align: alignLeft,
      width: 120,
      render: (type: string) => {
        const displayTypeLabel = type === 'RADIO'
          ? t('common:text-radio')
          : type === 'CHECKBOX'
            ? t('common:text-checkbox')
            : type;
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {displayTypeLabel}
          </span>
        );
      },
    },
    {
      title: t('form:input-label-min-select') || 'Min Select',
      dataIndex: 'min_select',
      key: 'min_select',
      align: 'center',
      width: 100,
      render: (min: number) => min,
    },
    {
      title: t('form:input-label-max-select') || 'Max Select',
      dataIndex: 'max_select',
      key: 'max_select',
      align: 'center',
      width: 100,
      render: (max: number) => max,
    },
    {
      title: t('form:input-label-applies-per-quantity') || 'Per Quantity',
      dataIndex: 'applies_per_quantity',
      key: 'applies_per_quantity',
      align: 'center',
      width: 120,
      render: (applies: boolean) => (
        <span className={applies ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {applies ? t('common:text-yes') : t('common:text-no')}
        </span>
      ),
    },
    {
      title: t('form:input-label-modifiers-count') || 'Modifiers',
      dataIndex: 'modifiers',
      key: 'modifiers_count',
      align: 'center',
      width: 100,
      render: (modifiers: Modifier[]) => (
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {modifiers?.length || 0}
        </span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: ModifierGroup) => {
        if (!canUpdate && !canDelete) return null;

        return (
          <div className="inline-flex items-center gap-3">
            {canUpdate && (
              <div
                title={t('common:text-status')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                <Switch
                  checked={record?.is_active}
                  onChange={(checked: boolean) => {
                    setTogglingId(record.id);
                    openModal('TOGGLE_MODIFIER_GROUP_STATUS', record);
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                  className={`${record?.is_active ? 'bg-accent' : 'bg-gray-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle Status</span>
                  <span
                    className={`${record?.is_active ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
                  />
                </Switch>
              </div>
            )}

            {canUpdate && (
              <Link
                href={Routes.modifierGroup.edit(record.id, locale!)}
                className="text-base transition duration-200 hover:text-heading p-1"
                title={t('common:text-edit')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                <EditIcon width={16} />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setDeletingId(record.id);
                  openModal('DELETE_MODIFIER_GROUP', record.id);
                }}
                className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none p-1"
                title={t('common:text-delete')}
              >
                <TrashIcon width={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {groups.map((group) => (
          <ResponsiveCard
            key={group.id}
            onClick={() => handleRowClick(group)}
            isActive={group.is_active}
            isDeleting={deletingId === group.id}
            isToggling={togglingId === group.id}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardBadge variant={group.display_type === 'RADIO' ? 'info' : 'default'}>
                {group.display_type === 'RADIO'
                  ? t('common:text-radio')
                  : t('common:text-checkbox')}
              </CardBadge>
            </CardHeader>
            <CardContent>
              <CardRow
                label={t('form:input-label-min-select') || 'Min Select'}
                value={group.min_select}
              />
              <CardRow
                label={t('form:input-label-max-select') || 'Max Select'}
                value={group.max_select}
              />
              <CardRow
                label={t('form:input-label-modifiers-count') || 'Modifiers'}
                value={
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {group.modifiers?.length || 0}
                  </span>
                }
              />
              {group.applies_per_quantity && (
                <CardRow
                  label={t('form:input-label-applies-per-quantity') || 'Per Quantity'}
                  value={<span className="text-green-600 font-medium">{t('common:text-yes')}</span>}
                />
              )}
            </CardContent>

            {(canUpdate || canDelete) && (
              <CardActions>
                {canUpdate && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={group.is_active}
                      onChange={() => {
                        setTogglingId(group.id);
                        openModal('TOGGLE_MODIFIER_GROUP_STATUS', group);
                      }}
                      className={`${group.is_active ? 'bg-accent' : 'bg-gray-300'
                        } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                    >
                      <span className="sr-only">Toggle Status</span>
                      <span
                        className={`${group.is_active ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
                      />
                    </Switch>
                  </div>
                )}
                {canUpdate && (
                  <Link
                    href={Routes.modifierGroup.edit(group.id, locale!)}
                    className="text-body hover:text-heading p-2"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <EditIcon width={18} />
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setDeletingId(group.id);
                      openModal('DELETE_MODIFIER_GROUP', group.id);
                    }}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    <TrashIcon width={18} />
                  </button>
                )}
              </CardActions>
            )}
          </ResponsiveCard>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-6 overflow-hidden rounded-lg shadow">
        <Table
          //@ts-ignore
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
          data={groups}
          rowKey="id"
          scroll={{ x: 1000 }}
          onRow={(record: any) => {
            const baseClassName = 'cursor-pointer hover:bg-gray-50 transition-colors';
            const statusClassName =
              record.id === deletingId
                ? 'animate-pulse bg-red-100/30'
                : record.id === togglingId
                  ? 'animate-pulse bg-accent/10'
                  : '';

            return {
              onClick: (e: React.MouseEvent) => {
                const target = e.target as HTMLElement;
                const isActionElement =
                  target.closest('button') ||
                  target.closest('a') ||
                  target.closest('[role="switch"]') ||
                  target.closest('[data-action]');

                if (isActionElement) {
                  e.stopPropagation();
                  return;
                }

                handleRowClick(record);
              },
              className: `${baseClassName} ${statusClassName}`.trim(),
              style: { cursor: 'pointer' },
            };
          }}
        />
      </div>

      {paginatorInfo && paginatorInfo.total > 0 && (
        <div className="flex items-center justify-end mt-6">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage || 1}
            pageSize={paginatorInfo.perPage || 20}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default ModifierGroupList;
