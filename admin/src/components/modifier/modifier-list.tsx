import React, { useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Modifier, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { Switch } from '@headlessui/react';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
import Link from '@/components/ui/link';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';
import usePrice from '@/utils/use-price';
import { mockModifierGroups } from '@/data/mock/modifiers';
import {
  ResponsiveCard,
  CardHeader,
  CardTitle,
  CardBadge,
  CardContent,
  CardRow,
  CardActions,
} from '@/components/ui/responsive-card';
import { SkeletonCard } from '@/components/ui/loading-skeleton';
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

export type IProps = {
  modifiers: Modifier[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
  isLoading?: boolean;
  enabledDnD?: boolean;
};

const PriceDisplay = ({ amount }: { amount: number }) => {
  const { price } = usePrice({ amount });
  return <span className="whitespace-nowrap">{price}</span>;
};

const ModifierList = ({
  modifiers,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
  isLoading = false,
  enabledDnD = false,
}: IProps) => {
  const { t } = useTranslation(['common', 'form', 'table']);
  const { openModal } = useModalAction();
  const { isOpen } = useModalState();
  const router = useRouter();
  const { locale } = router;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Local state for optimistic updates
  const [itemsList, setItemsList] = useState<Modifier[]>([]);

  useEffect(() => {
    if (modifiers) {
      setItemsList(modifiers);
    }
  }, [modifiers]);

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
  // Note: For modifiers, the endpoint depends on the group.
  const updateSortOrder = useMutation({
    mutationFn: async (newItems: { id: string; order: number }[]) => {
      // We need groupId. We can get it from the first item since we assume homogenous group context
      // if enabledDnD is true.
      const groupId = itemsList[0]?.modifier_group_id;
      if (!groupId) return; // Should not happen if list not empty

      // Endpoint: /modifier-groups/:groupId/modifiers/sort-order
      // Construct URL
      const url = `${API_ENDPOINTS.MODIFIER_GROUPS}/${groupId}/modifiers/sort-order`;
      return HttpClient.post(url, { items: newItems });
    },
    onError: (error) => {
      console.error('Failed to update sort order', error);
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

  // Helper to get group name
  const getGroupName = (groupId: string) => {
    const group = mockModifierGroups.find((g) => g.id === groupId);
    return group?.name || groupId;
  };

  const { permissions, role } = getAuthCredentials();
  const canUpdate =
    role === 'super_admin' || hasPermission(['modifiers:update'], permissions);
  const canDelete =
    role === 'super_admin' || hasPermission(['modifiers:delete'], permissions);

  // Show skeleton when loading
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!modifiers || modifiers.length === 0) {
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

  const getModifierPrice = (modifier: Modifier): number | null => {
    if (modifier.prices_by_size) {
      const prices =
        modifier.prices_by_size?.filter((p: any) => p !== undefined) || [];
      if (prices.length > 0 && prices[0].priceDelta !== undefined) {
        return prices[0].priceDelta;
      }
    }
    if (modifier.quantity_levels && modifier.quantity_levels.length > 0) {
      const price = modifier.quantity_levels[0].price;
      if (price !== undefined) {
        return price;
      }
    }
    return null;
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
      render: (name: string) => (
        <div className="font-medium text-heading">{name}</div>
      ),
    },
    {
      title: t('form:input-label-modifier-group') || 'Group',
      dataIndex: 'modifier_group_id',
      key: 'modifier_group_id',
      align: alignLeft,
      width: 150,
      render: (groupId: string, record: Modifier) => (
        <Link
          href={`/modifiers/groups/${groupId}`}
          className="text-body hover:text-accent transition-colors"
        >
          {record.modifier_group?.name || getGroupName(groupId)}
        </Link>
      ),
    },

    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: Modifier) => {
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
                    openModal('TOGGLE_MODIFIER_STATUS', record);
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
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  router.push(
                    `/modifiers/groups/${record.modifier_group_id}?editModifier=${record.id}`,
                  );
                }}
                className="text-base transition duration-200 hover:text-heading p-1"
                title={t('common:text-edit')}
              >
                <EditIcon width={16} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setDeletingId(record.id);
                  openModal('DELETE_MODIFIER', {
                    id: record.id,
                    modifier_group_id: record.modifier_group_id,
                  });
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

  const draggableProps = enabledDnD
    ? {
        components: {
          body: {
            row: SortableRow,
          },
        },
      }
    : {};

  return (
    <>
      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {enabledDnD && itemsList.length > 0 ? (
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
            renderItem={(modifier, dragHandleProps) => {
              const price = getModifierPrice(modifier);
              return (
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
                    isActive={modifier.is_active}
                    isDeleting={deletingId === modifier.id}
                    isToggling={togglingId === modifier.id}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle>{modifier.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardRow
                        label={t('form:input-label-modifier-group') || 'Group'}
                        value={
                          <Link
                            href={`/modifiers/groups/${modifier.modifier_group_id}`}
                            className="text-accent hover:underline"
                            onClick={(e: React.MouseEvent) =>
                              e.stopPropagation()
                            }
                          >
                            {modifier.modifier_group?.name ||
                              getGroupName(modifier.modifier_group_id)}
                          </Link>
                        }
                      />
                      {price !== null && (
                        <CardRow
                          label={t('form:input-label-price') || 'Price'}
                          value={<PriceDisplay amount={price} />}
                        />
                      )}
                    </CardContent>

                    {(canUpdate || canDelete) && (
                      <CardActions>
                        {canUpdate && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={modifier.is_active}
                              onChange={() => {
                                setTogglingId(modifier.id);
                                openModal('TOGGLE_MODIFIER_STATUS', modifier);
                              }}
                              className={`${
                                modifier.is_active ? 'bg-accent' : 'bg-gray-300'
                              } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                            >
                              <span className="sr-only">Toggle Status</span>
                              <span
                                className={`${
                                  modifier.is_active
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
                              />
                            </Switch>
                          </div>
                        )}
                        {canUpdate && (
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              router.push(
                                `/modifiers/groups/${modifier.modifier_group_id}?editModifier=${modifier.id}`,
                              );
                            }}
                            className="text-body hover:text-heading p-2"
                          >
                            <EditIcon width={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setDeletingId(modifier.id);
                              openModal('DELETE_MODIFIER', {
                                id: modifier.id,
                                modifier_group_id: modifier.modifier_group_id,
                              });
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
              );
            }}
          />
        ) : (
          itemsList.map((modifier) => {
            const price = getModifierPrice(modifier);
            return (
              <ResponsiveCard
                key={modifier.id}
                isActive={modifier.is_active}
                isDeleting={deletingId === modifier.id}
                isToggling={togglingId === modifier.id}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{modifier.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardRow
                    label={t('form:input-label-modifier-group') || 'Group'}
                    value={
                      <Link
                        href={`/modifiers/groups/${modifier.modifier_group_id}`}
                        className="text-accent hover:underline"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        {modifier.modifier_group?.name ||
                          getGroupName(modifier.modifier_group_id)}
                      </Link>
                    }
                  />
                  {price !== null && (
                    <CardRow
                      label={t('form:input-label-price') || 'Price'}
                      value={<PriceDisplay amount={price} />}
                    />
                  )}
                </CardContent>

                {(canUpdate || canDelete) && (
                  <CardActions>
                    {canUpdate && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={modifier.is_active}
                          onChange={() => {
                            setTogglingId(modifier.id);
                            openModal('TOGGLE_MODIFIER_STATUS', modifier);
                          }}
                          className={`${
                            modifier.is_active ? 'bg-accent' : 'bg-gray-300'
                          } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                        >
                          <span className="sr-only">Toggle Status</span>
                          <span
                            className={`${
                              modifier.is_active
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
                          />
                        </Switch>
                      </div>
                    )}
                    {canUpdate && (
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          router.push(
                            `/modifiers/groups/${modifier.modifier_group_id}?editModifier=${modifier.id}`,
                          );
                        }}
                        className="text-body hover:text-heading p-2"
                      >
                        <EditIcon width={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setDeletingId(modifier.id);
                          openModal('DELETE_MODIFIER', {
                            id: modifier.id,
                            modifier_group_id: modifier.modifier_group_id,
                          });
                        }}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <TrashIcon width={18} />
                      </button>
                    )}
                  </CardActions>
                )}
              </ResponsiveCard>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-6 overflow-hidden rounded-lg shadow">
        {enabledDnD && itemsList.length > 0 ? (
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
                {...draggableProps}
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
              />
            </SortableContext>
          </DndContext>
        ) : (
          <Table
            //@ts-ignore
            columns={columns}
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
          />
        )}
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

export default ModifierList;
