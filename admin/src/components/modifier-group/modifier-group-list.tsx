import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState, useEffect } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import {
  ModifierGroup,
  MappedPaginatorInfo,
  SortOrder,
  Modifier,
} from '@/types';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import Link from '@/components/ui/link';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { Switch } from '@headlessui/react';
import { NoDataFound } from '@/components/icons/no-data-found';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from '@/components/ui/sortable-row';
import { SortableList } from '@/components/ui/sortable-list';
import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';
import { toast } from 'react-toastify';

export type IProps = {
  groups: ModifierGroup[] | undefined | null;
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

  // Local state for optimistic updates
  const [itemsList, setItemsList] = useState<ModifierGroup[]>([]);

  useEffect(() => {
    if (groups) {
      setItemsList(groups);
    }
  }, [groups]);

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

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sorting Mutation
  const updateSortOrder = useMutation({
    mutationFn: async (newItems: { id: string; order: number }[]) => {
      return HttpClient.post(API_ENDPOINTS.MODIFIER_GROUPS + '/sort-order', {
        items: newItems,
      });
    },
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error) => {
      console.error('Failed to update sort order', error);
      toast.error(t('common:update-failed'));
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItemsList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const pageSize = paginatorInfo?.perPage || 10;
        const currentPage = paginatorInfo?.currentPage || 1;
        const startOrder = (currentPage - 1) * pageSize;

        const payload = newItems.map((item, index) => ({
          id: item.id,
          order: startOrder + index,
        }));

        updateSortOrder.mutate(payload);

        return newItems;
      });
    }
  };

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc
          ? SortOrder.Asc
          : SortOrder.Desc,
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
  const canUpdate =
    role === 'super_admin' ||
    hasPermission(['modifier_groups:update'], permissions);
  const canDelete =
    role === 'super_admin' ||
    hasPermission(['modifier_groups:delete'], permissions);

  // Show skeleton when loading
  if (isLoading) {
    return <ModifierGroupListSkeleton />;
  }

  // Show empty state
  // Using itemsList to check for empty state now, but initially it might be empty before effect runs?
  // itemsList is initialized to [] but effect sets it.
  // Should fallback to groups if itemsList is empty possibly?
  // Or just rely on props being passed.
  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 bg-white rounded-lg shadow">
        <NoDataFound className="w-52" />
        <div className="mb-1 pt-6 text-base font-semibold text-heading">
          {t('table:empty-table-data')}
        </div>
        <p className="text-[13px] text-body">
          {t('table:empty-table-sorry-text')}
        </p>
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
        const displayTypeLabel =
          type === 'RADIO'
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
            {/* View Details */}
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openModal('VIEW_DETAILS', record);
              }}
              className="text-accent transition duration-200 hover:text-accent-hover focus:outline-none"
              title={t('common:text-view-details')}
            >
              <EyeIcon width={18} />
            </button>
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
                  className={`${
                    record?.is_active ? 'bg-accent' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle Status</span>
                  <span
                    className={`${
                      record?.is_active ? 'translate-x-6' : 'translate-x-1'
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
        <SortableList
          items={itemsList}
          onSortEnd={(oldIndex, newIndex) => {
            setItemsList((currentItems) => {
              const newItems = arrayMove(currentItems, oldIndex, newIndex);

              const pageSize = paginatorInfo?.perPage || 10;
              const currentPage = paginatorInfo?.currentPage || 1;
              const startOrder = (currentPage - 1) * pageSize;

              const payload = newItems.map((item, index) => ({
                id: item.id,
                order: startOrder + index,
              }));

              updateSortOrder.mutate(payload);
              return newItems;
            });
          }}
          renderItem={(group, dragHandleProps) => (
            <div className="relative">
              <div
                {...dragHandleProps}
                className="absolute top-2 right-2 p-2 cursor-grab text-gray-400 z-10 touch-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
              </div>
              <ResponsiveCard
                onClick={() => handleRowClick(group)}
                isActive={group.is_active}
                isDeleting={deletingId === group.id}
                isToggling={togglingId === group.id}
              >
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardBadge
                    variant={
                      group.display_type === 'RADIO' ? 'info' : 'default'
                    }
                  >
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
                          className={`${
                            group.is_active ? 'bg-accent' : 'bg-gray-300'
                          } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                        >
                          <span className="sr-only">Toggle Status</span>
                          <span
                            className={`${
                              group.is_active
                                ? 'translate-x-6'
                                : 'translate-x-1'
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
            </div>
          )}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-6 overflow-hidden rounded-lg shadow">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemsList.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              //@ts-ignore
              columns={columns}
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              emptyText={() => (
                <div className="flex flex-col items-center py-7">
                  <NoDataFound className="w-52" />
                  <div className="mb-1 pt-6 text-base font-semibold text-heading">
                    {t('table:empty-table-data')}
                  </div>
                  <p className="text-[13px]">
                    {t('table:empty-table-sorry-text')}
                  </p>
                </div>
              )}
              data={itemsList}
              rowKey="id"
              scroll={{ x: 1000 }}
              onRow={(record: any) => {
                const baseClassName =
                  'cursor-pointer hover:bg-gray-50 transition-colors';
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
          </SortableContext>
        </DndContext>
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
