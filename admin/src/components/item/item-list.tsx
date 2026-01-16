import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import Badge from '@/components/ui/badge/badge';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import { Item, MappedPaginatorInfo, SortOrder } from '@/types';
import { useIsRTL } from '@/utils/locals';
import { useState, useEffect } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useUpdateItemMutation } from '@/data/item';
import { StarIcon } from '@/components/icons/star-icon';
import { EditIcon } from '@/components/icons/edit';
import { CheckMark } from '@/components/icons/checkmark';
import { CloseIcon } from '@/components/icons/close-icon';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import Loader from '@/components/ui/loader/loader';
import Card from '@/components/common/card';

export type IProps = {
  items: Item[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

type SortingObjType = {
  sort: SortOrder;
  column: string | null;
};

const PriceWidget = ({ amount }: { amount: number }) => {
  const { price } = usePrice({
    amount,
  });
  return (
    <span className="whitespace-nowrap" title={price}>
      {price}
    </span>
  );
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

  const [sortingObj, setSortingObj] = useState<SortingObjType>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [togglingSignatureId, setTogglingSignatureId] = useState<string | null>(
    null,
  );
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);

  // Clear loading state when modal closes
  useEffect(() => {
    if (!isOpen && view !== 'TOGGLE_ITEM_STATUS') {
      setTogglingActiveId(null);
    }
  }, [isOpen, view]);

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
      title: t('table:table-item-product'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      render: (name: string, record: Item) => (
        <div className="flex items-center">
          <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
            <img
              src={record.image ?? siteSettings.product.placeholder}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => openModal('ITEM_PREVIEW', { id: record.id })}
              className="truncate text-left font-medium text-heading hover:text-accent transition-colors"
            >
              {name}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: t('common:sidebar-nav-item-categories'),
      dataIndex: 'category',
      key: 'category',
      width: 150,
      align: alignLeft,
      ellipsis: true,
      render: (category: any, record: any) => (
        <span className="truncate whitespace-nowrap">
          {category?.name ?? record.category_id}
        </span>
      ),
    },
    {
      title: t('table:table-item-base-price'),
      dataIndex: 'base_price',
      key: 'base_price',
      align: alignRight,
      width: 150,
      render: function Render(_value: number | undefined, record: Item) {
        // Always use record.base_price directly (more reliable)
        const basePrice = (record?.base_price as number) ?? 0;
        return <PriceWidget amount={basePrice} />;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      width: 100,
      render: (is_active: boolean) => (
        <Badge
          textKey={is_active ? 'common:text-active' : 'common:text-inactive'}
          color={
            !is_active
              ? 'bg-yellow-400/10 text-yellow-500'
              : 'bg-accent bg-opacity-10 !text-accent'
          }
          className="capitalize"
        />
      ),
    },
    {
      title: t('common:text-available'),
      dataIndex: 'is_available',
      key: 'is_available',
      align: 'center',
      width: 120,
      render: (is_available: boolean) => (
        <Badge
          textKey={
            is_available ? 'common:text-available' : 'common:text-unavailable'
          }
          color={
            !is_available
              ? 'bg-red-400/10 text-red-500'
              : 'bg-green-400/10 text-green-500'
          }
          className="capitalize"
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 150,
      render: (id: string, record: Item) => (
        <div className="flex items-center justify-end gap-3">
          {/* Is Signature Toggle */}
          <button
            onClick={() => {
              setTogglingSignatureId(record.id);
              updateItem(
                { id: record.id, is_signature: !record.is_signature },
                {
                  onSuccess: () => {
                    setTogglingSignatureId(null);
                  },
                  onError: () => {
                    setTogglingSignatureId(null);
                  },
                },
              );
            }}
            disabled={togglingSignatureId === record.id && isUpdating}
            className="text-lg transition duration-200 hover:scale-110 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={t('form:input-label-signature-dish')}
          >
            {togglingSignatureId === record.id && isUpdating ? (
              <Loader simple={true} className="h-5 w-5" />
            ) : (
              <StarIcon
                className={
                  record.is_signature ? 'text-orange-400' : 'text-gray-300'
                }
                width={20}
              />
            )}
          </button>

          {/* View Item Preview */}
          <button
            onClick={() => openModal('ITEM_PREVIEW', { id: record.id })}
            className="text-base transition duration-200 hover:text-heading"
            title={t('common:text-view')}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-body hover:text-accent"
            >
              <path
                d="M10 4C4 4 1 10 1 10s3 6 9 6 9-6 9-6-3-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Is Active Toggle with Confirm */}
          <button
            onClick={() => {
              setTogglingActiveId(record.id);
              openModal('TOGGLE_ITEM_STATUS', {
                ...record,
                onComplete: () => setTogglingActiveId(null),
              });
            }}
            disabled={togglingActiveId === record.id && isUpdating}
            className="text-lg transition duration-200 hover:scale-110 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={t('form:input-label-active')}
          >
            {togglingActiveId === record.id && isUpdating ? (
              <Loader simple={true} className="h-5 w-5" />
            ) : record.is_active ? (
              <CheckMark className="text-accent" width={20} />
            ) : (
              <CloseIcon className="text-red-500" width={20} />
            )}
          </button>

          <Link
            href={Routes.item.editWithoutLang(id, shop as string)}
            className="text-base transition duration-200 hover:text-heading"
            title={t('common:text-edit')}
          >
            <EditIcon width={20} />
          </Link>

          <button
            onClick={() => openModal('DELETE_ITEM', id)}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-delete')}
          >
            <TrashIcon width={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        {/* Desktop: Full table, Mobile: Responsive cards */}
        <div className="hidden md:block">
          <Table
            /* @ts-ignore */
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
            data={items}
            rowKey="id"
            scroll={{ x: 1000 }}
          />
        </div>
        {/* Mobile: Card view */}
        <div className="block md:hidden space-y-4">
          {!items || items.length === 0 ? (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          ) : (
            items.map((item: Item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100">
                      <img
                        src={item.image ?? siteSettings.product.placeholder}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          openModal('ITEM_PREVIEW', { id: item.id })
                        }
                        className="text-left font-medium text-heading hover:text-accent transition-colors line-clamp-2"
                      >
                        {item.name}
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.category?.name ?? item.category_id}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {t('form:input-label-price')}
                      </span>
                      <PriceWidget amount={(item?.base_price as number) ?? 0} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {t('form:input-label-status')}
                      </span>
                      <div className="mt-1">
                        <Badge
                          textKey={
                            item.is_active
                              ? 'common:text-active'
                              : 'common:text-inactive'
                          }
                          color={
                            !item.is_active
                              ? 'bg-yellow-400/10 text-yellow-500'
                              : 'bg-accent bg-opacity-10 !text-accent'
                          }
                          className="capitalize"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => {
                        setTogglingSignatureId(item.id);
                        updateItem(
                          {
                            id: item.id,
                            is_signature: !item.is_signature,
                          },
                          {
                            onSuccess: () => {
                              setTogglingSignatureId(null);
                            },
                          },
                        );
                      }}
                      className="text-gray-400 hover:text-accent transition-colors"
                      title={
                        item.is_signature
                          ? t('form:action-remove-signature')
                          : t('form:action-mark-signature')
                      }
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                    <Link
                      href={Routes.item.editWithoutLang(
                        item.id,
                        shop as string,
                      )}
                      className="text-gray-400 hover:text-accent transition-colors"
                    >
                      <EditIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => openModal('DELETE_ITEM', item)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
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
            showLessItems
          />
        </div>
      )}
    </>
  );
};

export default ItemList;
