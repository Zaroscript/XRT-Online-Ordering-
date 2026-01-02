import React, { useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { getIcon } from '@/utils/get-icon';
import * as categoriesIcon from '@/components/icons/category';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Category, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { siteSettings } from '@/settings/site.settings';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { Switch } from '@headlessui/react';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';

// Component to handle icon rendering with error state
const CategoryIcon = ({ icon }: { icon: string }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Pre-check: if URL contains known broken patterns, don't render
  const isLikelyBroken = icon.includes('v1703515000') && icon.includes('dessert.svg');

  if (isLikelyBroken || imageError) {
    return null; // Don't render broken images
  }

  return (
    <div className="relative h-5 w-5 mx-auto">
      <img
        src={icon}
        alt="category-icon"
        className="h-full w-full object-contain"
        style={{ display: imageLoaded ? '' : 'none' }}
        onError={(e) => {
          // Silently handle broken images - hide the element
          e.preventDefault();
          e.stopPropagation();
          setImageError(true);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          // Remove the src to prevent retry attempts
          target.src = '';
          // Also hide parent container if image fails
          if (target.parentElement) {
            target.parentElement.style.display = 'none';
          }
        }}
        onLoad={() => {
          // Ensure image is visible on successful load
          setImageLoaded(true);
        }}
      />
    </div>
  );
};


export type IProps = {
  categories: Category[] | undefined;
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
  const { locale } = useRouter();
  const rowExpandable = (record: any) => record.children?.length;
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
    },
    {
      title: t('table:table-item-image'),
      dataIndex: 'image',
      key: 'image',
      align: alignLeft,
      width: 80,
      render: (image: any, { name }: { name: string }) => (
        <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100">
          <img
            src={typeof image === 'string' ? image : image?.thumbnail ?? siteSettings.product.placeholder}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
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
        if (icon.startsWith('http') || icon.startsWith('/') || icon.includes('cloudinary')) {
          return <CategoryIcon icon={icon} />;
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
      title: t('form:input-label-kitchen-section') === 'input-label-kitchen-section' ? 'Kitchen Section' : t('form:input-label-kitchen-section'),
      dataIndex: 'kitchen_section_id',
      key: 'kitchen_section_id',
      align: 'center',
      width: 120,
      render: (id: string) => {
        if (!id) return null;
        // Hard fallbacks to ensure text is always displayed even if translation fails
        const getFallback = (key: string, accessKey: string, fallback: string) => {
          const val = t(accessKey);
          return val === key || val === accessKey ? fallback : val;
        };

        const sections: any = {
          'KS_001': getFallback('kitchen-section-appetizers', 'common:kitchen-section-appetizers', 'Appetizers'),
          'KS_002': getFallback('kitchen-section-main-course', 'common:kitchen-section-main-course', 'Main Course'),
          'KS_003': getFallback('kitchen-section-desserts', 'common:kitchen-section-desserts', 'Desserts'),
          'KS_004': getFallback('kitchen-section-beverages', 'common:kitchen-section-beverages', 'Beverages')
        };
        // If it's one of our predefined IDs, use the map
        if (sections[id]) return sections[id];

        // Dynamic fallback: clean string if translation fails
        const translated = t(`common:${id}`);
        if (translated !== `common:${id}` && translated !== id) return translated;

        // Final fallback: prettify the ID/Key
        return id.replace('kitchen-section-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: Category) => {
        const { permissions, role } = getAuthCredentials();
        const canUpdate = role === 'super_admin' || hasPermission(['categories:update'], permissions);
        const canDelete = role === 'super_admin' || hasPermission(['categories:delete'], permissions);

        if (!canUpdate && !canDelete) return null;

        return (
          <div className="inline-flex items-center gap-3">
            {canUpdate && (
              <div title={t('common:text-status')}>
                <Switch
                  checked={record?.is_active}
                  onChange={() => {
                    setTogglingId(record.id);
                    openModal('TOGGLE_CATEGORY_STATUS', record);
                  }}
                  className={`${record?.is_active ? 'bg-accent' : 'bg-gray-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
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
                href={Routes.category.edit(record.id, locale!)}
                className="text-base transition duration-200 hover:text-heading"
                title={t('common:text-edit')}
              >
                <EditIcon width={16} />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => {
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
          data={categories}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => ' ',
            rowExpandable: rowExpandable,
          }}
          rowClassName={(record: any) =>
            record.id === deletingId
              ? 'animate-pulse bg-red-100/30'
              : record.id === togglingId
                ? 'animate-pulse bg-accent/10'
                : ''
          }
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

export default CategoryList;
