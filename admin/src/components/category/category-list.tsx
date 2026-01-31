import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';

import { getIcon } from '@/utils/get-icon';
import * as categoriesIcon from '@/components/icons/category';
import { Routes } from '@/config/routes';
import { Category, MappedPaginatorInfo, SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState, useEffect } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';

import { useRouter } from 'next/router';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import Link from '@/components/ui/link';
import { siteSettings } from '@/settings/site.settings';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { Switch } from '@headlessui/react';
import { NoDataFound } from '@/components/icons/no-data-found';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
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
import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export type IProps = {
  categories: Category[] | undefined | null;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const CategoryList = ({
  categories,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation(['common', 'form', 'table']);
  const { openModal } = useModalAction();
  const { isOpen } = useModalState();
  const router = useRouter();
  const { locale } = router;
  const rowExpandable = (record: any) => record.children?.length;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Local state for optimistic updates
  const [itemsList, setItemsList] = useState<Category[]>([]);

  useEffect(() => {
    if (categories) {
      setItemsList(categories);
    }
  }, [categories]);

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
      // API_ENDPOINTS.CATEGORIES is 'categories', so we append /sort-order
      return HttpClient.post(API_ENDPOINTS.CATEGORIES + '/sort-order', {
        items: newItems,
      });
    },
    onError: (error) => {
      console.error('Failed to update sort order', error);
      // Optionally revert state here if needed
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
      width: 150,
      onHeaderCell: () => onHeaderClick('name'),
      render: (name: string, record: Category) => (
        <Link
          href={`/categories/${record.id}/items`}
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
      title: t('table:table-item-image'),
      dataIndex: 'image',
      key: 'image',
      align: alignLeft,
      width: 80,
      render: (image: any, record: Category) => (
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            router.push(`/categories/${record.id}/items`);
          }}
          className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 cursor-pointer"
        >
          <img
            src={
              typeof image === 'string'
                ? image
                : (image?.thumbnail ?? siteSettings.product.placeholder)
            }
            alt={record.name}
            className="h-full w-full object-cover"
          />
        </button>
      ),
    },
    {
      title: t('table:table-item-icon'),
      dataIndex: 'icon',
      key: 'icon',
      align: 'center',
      width: 80,
      render: (icon: string) => {
        if (!icon) return null;
        if (
          icon.startsWith('http') ||
          icon.startsWith('/') ||
          icon.includes('cloudinary')
        ) {
          return (
            <div className="flex items-center justify-center">
              <img
                src={icon}
                alt="Category Icon"
                className="w-5 h-5 max-h-full max-w-full"
              />
            </div>
          );
        }
        return (
          <span className="flex items-center justify-center">
            {getIcon({
              iconList: categoriesIcon,
              iconName: icon,
              className: 'w-5 h-5 max-h-full max-w-full',
            })}
          </span>
        );
      },
    },
    {
      title:
        t('form:input-label-kitchen-section') === 'input-label-kitchen-section'
          ? 'Kitchen Section'
          : t('form:input-label-kitchen-section'),
      dataIndex: 'kitchen_section_id',
      key: 'kitchen_section_id',
      align: 'center',
      width: 120,
      render: (id: string, record: Category) => {
        if (!id) return null;
        // Hard fallbacks to ensure text is always displayed even if translation fails
        const getFallback = (
          key: string,
          accessKey: string,
          fallback: string,
        ) => {
          const val = t(accessKey);
          return val === key || val === accessKey ? fallback : val;
        };

        const sections: any = {
          KS_001: getFallback(
            'kitchen-section-appetizers',
            'common:kitchen-section-appetizers',
            'Appetizers',
          ),
          KS_002: getFallback(
            'kitchen-section-main-course',
            'common:kitchen-section-main-course',
            'Main Course',
          ),
          KS_003: getFallback(
            'kitchen-section-desserts',
            'common:kitchen-section-desserts',
            'Desserts',
          ),
          KS_004: getFallback(
            'kitchen-section-beverages',
            'common:kitchen-section-beverages',
            'Beverages',
          ),
        };
        // If it's one of our predefined IDs, use the map
        const sectionName =
          sections[id] ||
          (t(`common:${id}`) !== `common:${id}` && t(`common:${id}`) !== id
            ? t(`common:${id}`)
            : id
                .replace('kitchen-section-', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()));

        return (
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              router.push(`/categories/${record.id}/items`);
            }}
            className="cursor-pointer hover:text-accent transition-colors"
          >
            {sectionName}
          </button>
        );
      },
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: Category) => {
        const { permissions, role } = getAuthCredentials();
        const canUpdate =
          role === 'super_admin' ||
          hasPermission(['categories:update'], permissions);
        const canDelete =
          role === 'super_admin' ||
          hasPermission(['categories:delete'], permissions);

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
                    openModal('TOGGLE_CATEGORY_STATUS', record);
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                  className={`${
                    record?.is_active ? 'bg-accent' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
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
                href={Routes.category.edit(record.id, locale!)}
                className="text-base transition duration-200 hover:text-heading"
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
                  openModal('DELETE_CATEGORY', record.id);
                }}
                className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
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
      <div className="mb-6 overflow-hidden rounded shadow">
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
              expandable={{
                expandedRowRender: () => ' ',
                rowExpandable: rowExpandable,
              }}
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
                    // Only navigate if clicking directly on the row, not on action buttons
                    const target = e.target as HTMLElement;
                    // Check if click is on an action button, link, switch, or expand icon
                    const isActionElement =
                      target.closest('button') ||
                      target.closest('a') ||
                      target.closest('[role="switch"]') ||
                      target.closest('.rc-table-row-expand-icon') ||
                      target.closest('[data-action]');

                    if (isActionElement) {
                      e.stopPropagation();
                      return; // Don't navigate if clicking on action elements
                    }

                    // Navigate to category items page when clicking anywhere on the row
                    e.preventDefault();
                    router
                      .push(`/categories/${record.id}/items`)
                      .catch((err) => {
                        console.error('Navigation error:', err);
                        // Fallback to window.location if router.push fails
                        window.location.href = `/categories/${record.id}/items`;
                      });
                  },
                  className: `${baseClassName} ${statusClassName}`.trim(),
                  style: { cursor: 'pointer' },
                };
              }}
            />
          </SortableContext>
        </DndContext>
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

export default CategoryList;
