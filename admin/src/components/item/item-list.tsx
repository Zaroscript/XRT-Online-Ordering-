import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import Badge from '@/components/ui/badge/badge';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import {
    Item,
    MappedPaginatorInfo,
    SortOrder,
} from '@/types';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useUpdateItemMutation } from '@/data/item';
import { StarIcon } from '@/components/icons/star-icon';
import { EditIcon } from '@/components/icons/edit';
import { CheckMark } from '@/components/icons/checkmark';
import { CloseIcon } from '@/components/icons/close-icon';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';

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
    const { mutate: updateItem } = useUpdateItemMutation();

    const [sortingObj, setSortingObj] = useState<SortingObjType>({
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
            title: t('table:table-item-product'),
            dataIndex: 'name',
            key: 'name',
            align: alignLeft,
            width: 250,
            ellipsis: true,
            render: (name: string, { image }: { image: string }) => (
                <div className="flex items-center">
                    <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
                        <img
                            src={image ?? siteSettings.product.placeholder}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="truncate font-medium">{name}</span>
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
                <span className="truncate whitespace-nowrap">{category?.name ?? record.category_id}</span>
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
                    textKey={is_available ? 'common:text-available' : 'common:text-unavailable'}
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
                        onClick={() => updateItem({ id: record.id, is_signature: !record.is_signature })}
                        className="text-lg transition duration-200 hover:scale-110 focus:outline-none"
                        title={t('form:input-label-signature-dish')}
                    >
                        <StarIcon
                            className={record.is_signature ? 'text-orange-400' : 'text-gray-300'}
                            width={20}
                        />
                    </button>

                    {/* Is Active Toggle with Confirm */}
                    <button
                        onClick={() => openModal('TOGGLE_ITEM_STATUS', record)}
                        className="text-lg transition duration-200 hover:scale-110 focus:outline-none"
                        title={t('form:input-label-active')}
                    >
                        {record.is_active ? (
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
                <Table
                    /* @ts-ignore */
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
                    data={items}
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
                        showLessItems
                    />
                </div>
            )}
        </>
    );
};

export default ItemList;
