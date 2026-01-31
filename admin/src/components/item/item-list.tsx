import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Item, MappedPaginatorInfo, SortOrder } from '@/types';
import TitleWithSort from '@/components/ui/title-with-sort';
import { siteSettings } from '@/settings/site.settings';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useUpdateItemMutation } from '@/data/item';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import Badge from '@/components/ui/badge/badge';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
import Card from '@/components/common/card';
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
  items: Item[] | undefined | null;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

type SortingObjType = {
  sort: SortOrder;
  column: string | null;
};

const ItemList = ({
  items,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const { openModal } = useModalAction();
  const { isOpen, view } = useModalState();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItemMutation();

  // Local state for items to handle immediate drag updates
  const [itemsList, setItemsList] = useState<Item[]>([]);

  useEffect(() => {
    if (items) {
      setItemsList(items);
    }
  }, [items]);

  const [sortingObj, setSortingObj] = useState<SortingObjType>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [togglingSignatureId, setTogglingSignatureId] = useState<string | null>(
    null,
  );
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);

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
      return HttpClient.post(API_ENDPOINTS.ITEMS + '/sort-order', {
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

        // Calculate new orders based on pagination
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

  useEffect(() => {
    if (!isOpen) {
      setTogglingSignatureId(null);
      setTogglingActiveId(null);
    }
  }, [isOpen]);

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

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-items') || 'Items'}
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
      width: 280,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: (
        name: string,
        { image, category }: { image: any; category: any },
      ) => (
        <div className="flex items-center">
          <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
            <img
              src={image?.thumbnail ?? siteSettings.product.placeholder}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="truncate font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-categories') || 'Categories',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      align: alignLeft,
      ellipsis: true,
      render: (category: any) => (
        <span className="whitespace-nowrap truncate">{category?.name}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-base-price') || 'Base Price'}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'base_price'
          }
          isActive={sortingObj.column === 'base_price'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'base_price',
      key: 'base_price',
      align: alignRight,
      width: 120,
      onHeaderCell: () => onHeaderClick('base_price'),
      render: (value: number) => {
        return (
          <span className="whitespace-nowrap">
            ${value?.toFixed(2) ?? '0.00'}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'is_active',
      key: 'status',
      align: 'center',
      width: 100,
      render: (is_active: boolean) => (
        <Badge
          text={is_active ? t('common:text-active') : t('common:text-inactive')}
          color={
            is_active
              ? 'bg-accent bg-opacity-10 !text-accent'
              : 'bg-gray-400/10 text-gray-500'
          }
          className="capitalize"
        />
      ),
    },
    {
      title: t('form:input-label-availability') || 'Available',
      dataIndex: 'is_available',
      key: 'available',
      align: 'center',
      width: 120,
      render: (is_available: boolean) => (
        <span
          className={`${
            is_available ? 'text-accent' : 'text-red-500'
          } font-medium`}
        >
          {is_available
            ? t('common:text-available')
            : t('common:text-unavailable')}
        </span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (id: string, record: Item) => (
        <div className="flex gap-2 justify-end items-center">
          {/* View Details */}
          <button
            onClick={() => {
              openModal('VIEW_DETAILS', record);
            }}
            className="text-accent transition duration-200 hover:text-accent-hover focus:outline-none"
            title={t('common:text-view-details')}
          >
            <EyeIcon width={18} />
          </button>
          {/* Signature Star */}
          <button
            onClick={() => {
              updateItem({
                id: record.id,
                is_signature: !record.is_signature,
              });
            }}
            className={`transition duration-200 focus:outline-none ${
              record.is_signature
                ? 'text-yellow-500'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={t('common:text-signature') || 'Signature'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={record.is_signature ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
          {/* Toggle Active/Inactive */}
          <button
            onClick={() => {
              updateItem({
                id: record.id,
                is_active: !record.is_active,
              });
            }}
            className={`transition duration-200 focus:outline-none ${
              record.is_active
                ? 'text-accent'
                : 'text-gray-400 hover:text-accent'
            }`}
            title={
              record.is_active
                ? t('common:text-deactivate')
                : t('common:text-activate')
            }
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          {/* Edit */}
          <Link
            href={Routes.item.editWithoutLang(id)}
            className="text-body transition duration-200 hover:text-heading"
            title={t('common:text-edit')}
          >
            <EditIcon width={16} />
          </Link>
          {/* Delete */}
          <button
            onClick={() => {
              openModal('DELETE_ITEM', id);
            }}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-delete')}
          >
            <TrashIcon width={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        {/* Desktop: Full table */}
        <div className="hidden md:block">
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
                /* @ts-ignore */
                columns={columns}
                /* Use custom SortableRow */
                components={{
                  body: {
                    row: SortableRow,
                  },
                }}
                /* Pass click listener logic to onRow in SortableRow via props? 
                   RC-Table passes onRow props to the row component. */
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
        </div>

        <div className="block md:hidden space-y-4">
          {!itemsList || itemsList.length === 0 ? (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          ) : (
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
              renderItem={(item, dragHandleProps) => (
                <Card className="p-4 relative">
                  {/* Drag Handle */}
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

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100">
                        <img
                          src={item.image ?? siteSettings.product.placeholder}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <button
                          onClick={() =>
                            router.push(`${router.asPath}/${item.slug}/edit`)
                          }
                          className="text-left font-medium text-heading hover:text-accent transition-colors line-clamp-2"
                        >
                          {item.name}
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.category?.name}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            text={
                              item.status ??
                              (item.is_active
                                ? t('common:text-publish')
                                : t('common:text-draft'))
                            }
                            color={
                              item.status?.toLowerCase() === 'publish' ||
                              item.is_active
                                ? 'bg-accent'
                                : 'bg-gray-400'
                            }
                            className={
                              item.status?.toLowerCase() === 'publish' ||
                              item.is_active
                                ? 'bg-accent'
                                : '!bg-gray-400'
                            }
                          />
                          <span className="text-sm font-semibold">
                            ${item.base_price?.toFixed(2) ?? '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            />
          )}
        </div>
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

export default ItemList;
