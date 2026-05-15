import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import cn from 'classnames';
import Avatar from '@/components/common/avatar';
import ActionButtons from '@/components/common/action-buttons';
import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import {
  getOrderStatusColors,
  getOrderStatusLabelKey,
  isScheduledOrder,
} from '@/data/order';
import { MappedPaginatorInfo, Order } from '@/types';
import { useIsRTL } from '@/utils/locals';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';

dayjs.extend(relativeTime);
dayjs.extend(utc);

type IProps = {
  orders: Order[];
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  searchElement?: React.ReactNode;
  title?: string;
  className?: string;
  isFetching?: boolean;
};

type RecentOrderRow = {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerSecondary: string;
  itemCount: number;
  createdAt: string;
  total: number;
  orderStatus: string;
  isScheduled: boolean;
  language?: string;
};

const EMPTY_CELL = '-';

function getCustomerName(order: Order) {
  return (
    order.customer?.name ||
    order.customer_name ||
    (order as any)?.delivery?.name ||
    ''
  );
}

function getCustomerSecondary(order: Order) {
  return (
    order.customer?.email ||
    order.customer_contact ||
    (order as any)?.delivery?.phone ||
    ''
  );
}

function normalizeRecentOrder(order: Order): RecentOrderRow {
  return {
    id: order.id,
    trackingNumber:
      formatOrderTrackingLabel(order.tracking_number, order.id) || EMPTY_CELL,
    customerName: getCustomerName(order),
    customerSecondary: getCustomerSecondary(order),
    itemCount: Array.isArray(order.products) ? order.products.length : 0,
    createdAt: order.created_at,
    total: Number(order.total) || 0,
    orderStatus: order.order_status,
    isScheduled: isScheduledOrder(order),
    language: order.language,
  };
}

function formatOrderDate(date: string) {
  const parsedDate = dayjs.utc(date).local();
  if (!parsedDate.isValid()) {
    return {
      absoluteLabel: EMPTY_CELL,
      relativeLabel: EMPTY_CELL,
    };
  }

  return {
    absoluteLabel: parsedDate.format('MMM D, YYYY h:mm A'),
    relativeLabel: parsedDate.fromNow(),
  };
}

const OrderPrice = ({ value }: { value: number }) => {
  const { price } = usePrice({
    amount: value,
  });

  return <span className="whitespace-nowrap font-medium">{price || EMPTY_CELL}</span>;
};

const OrderPlacedAt = ({ date }: { date: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { absoluteLabel, relativeLabel } = useMemo(
    () => formatOrderDate(date),
    [date],
  );

  return (
    <time
      dateTime={date}
      title={absoluteLabel}
      className="whitespace-nowrap text-sm text-body"
      suppressHydrationWarning
    >
      {isMounted ? relativeLabel : absoluteLabel}
    </time>
  );
};

// ─── Skeleton Components ───────────────────────────────────────────────────

const SkeletonCell = ({ className }: { className?: string }) => (
  <div className={cn('h-4 rounded bg-gray-200', className)} />
);

const RecentOrdersTableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b border-gray-100 px-2 py-4"
      >
        {/* tracking number */}
        <SkeletonCell className="w-28 shrink-0" />
        {/* customer */}
        <div className="flex flex-1 items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <SkeletonCell className="w-28" />
            <SkeletonCell className="w-20 opacity-60" />
          </div>
        </div>
        {/* items count */}
        <SkeletonCell className="w-8 shrink-0" />
        {/* date */}
        <SkeletonCell className="w-24 shrink-0" />
        {/* total */}
        <SkeletonCell className="w-16 shrink-0" />
        {/* status */}
        <div className="h-6 w-20 shrink-0 rounded-full bg-gray-200" />
        {/* actions */}
        <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-200" />
      </div>
    ))}
  </div>
);

const RecentOrdersMobileSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <SkeletonCell className="w-16" />
            <SkeletonCell className="w-36" />
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <SkeletonCell className="w-28" />
            <SkeletonCell className="w-20 opacity-60" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <SkeletonCell className="mb-2 w-12 opacity-60" />
            <SkeletonCell className="w-8" />
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <SkeletonCell className="mb-2 w-12 opacity-60" />
            <SkeletonCell className="w-16" />
          </div>
          <div className="col-span-full rounded-lg bg-gray-50 p-3">
            <SkeletonCell className="mb-2 w-16 opacity-60" />
            <SkeletonCell className="w-32" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecentOrdersEmptyState = () => {
  const { t } = useTranslation(['table']);

  return (
    <div className="flex flex-col items-center py-8">
      <NoDataFound className="w-44 text-body/60" />
      <div className="mb-1 pt-5 text-base font-semibold text-heading">
        {t('table:empty-table-data')}
      </div>
      <p className="text-center text-sm text-body">
        {t('table:empty-table-sorry-text')}
      </p>
    </div>
  );
};

const RecentOrdersStatusBadge = ({
  orderStatus,
  scheduled,
}: {
  orderStatus: string;
  scheduled: boolean;
}) => {
  const { t } = useTranslation(['common']);
  const statusKey = getOrderStatusLabelKey(orderStatus, scheduled);
  const statusColors = getOrderStatusColors(orderStatus, scheduled);

  return (
    <Badge
      text={t(`common:${statusKey}`)}
      color={statusColors.badge}
      className="rounded-full border px-2.5 py-1 font-medium"
    />
  );
};

const RecentOrdersMobileCard = ({ row }: { row: RecentOrderRow }) => {
  const { t } = useTranslation(['table', 'common']);

  return (
    <article className="rounded-xl border border-border-200 bg-light p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-body/70">
            {t('table:table-item-tracking-number')}
          </p>
          <p className="truncate text-base font-semibold text-heading">
            {row.trackingNumber}
          </p>
        </div>
        <RecentOrdersStatusBadge
          orderStatus={row.orderStatus}
          scheduled={row.isScheduled}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={row.customerName || t('common:text-guest')} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-heading">
            {row.customerName || t('common:text-guest')}
          </p>
          <p className="truncate text-sm text-body">
            {row.customerSecondary || EMPTY_CELL}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-[0.08em] text-body/70">
            {t('table:table-item-products')}
          </dt>
          <dd className="mt-1 font-semibold text-heading">{row.itemCount}</dd>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-[0.08em] text-body/70">
            {t('table:table-item-total')}
          </dt>
          <dd className="mt-1 text-heading">
            <OrderPrice value={row.total} />
          </dd>
        </div>
        <div className="col-span-full rounded-lg bg-gray-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-[0.08em] text-body/70">
            {t('table:table-item-order-date')}
          </dt>
          <dd className="mt-1">
            <OrderPlacedAt date={row.createdAt} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-end border-t border-border-200 pt-4">
        <ActionButtons
          id={row.id}
          detailsUrl={Routes.order.details(row.id)}
          customLocale={row.language}
        />
      </div>
    </article>
  );
};

const RecentOrders = ({
  orders,
  paginatorInfo,
  onPagination,
  searchElement,
  title,
  className,
  isFetching = false,
}: IProps) => {
  const { t } = useTranslation(['table', 'common']);
  const { alignLeft, alignRight } = useIsRTL();
  const sectionTitle = title || t('table:recent-order-table-title');

  const rows = useMemo(
    () => orders.map((order) => normalizeRecentOrder(order)),
    [orders],
  );

  const columns = useMemo(
    () => [
      {
        title: t('table:table-item-tracking-number'),
        dataIndex: 'trackingNumber',
        key: 'trackingNumber',
        align: alignLeft,
        width: 180,
        render: (trackingNumber: string) => (
          <span className="font-medium text-heading">{trackingNumber}</span>
        ),
      },
      {
        title: t('table:table-item-customer'),
        dataIndex: 'customerName',
        key: 'customerName',
        align: alignLeft,
        width: 260,
        render: (_: string, row: RecentOrderRow) => (
          <div className="flex min-w-0 items-center">
            <Avatar name={row.customerName || t('common:text-guest')} />
            <div className="ms-3 min-w-0">
              <div className="truncate font-medium text-heading">
                {row.customerName || t('common:text-guest')}
              </div>
              <div className="truncate text-[13px] text-body">
                {row.customerSecondary || EMPTY_CELL}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: t('table:table-item-products'),
        dataIndex: 'itemCount',
        key: 'itemCount',
        align: 'center',
        width: 110,
        render: (itemCount: number) => (
          <span className="font-medium text-heading">{itemCount}</span>
        ),
      },
      {
        title: t('table:table-item-order-date'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        width: 180,
        render: (createdAt: string) => <OrderPlacedAt date={createdAt} />,
      },
      {
        title: t('table:table-item-total'),
        dataIndex: 'total',
        key: 'total',
        align: 'center',
        width: 140,
        render: (total: number) => <OrderPrice value={total} />,
      },
      {
        title: t('table:table-item-status'),
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        align: 'center',
        width: 150,
        render: (_: string, row: RecentOrderRow) => (
          <RecentOrdersStatusBadge
            orderStatus={row.orderStatus}
            scheduled={row.isScheduled}
          />
        ),
      },
      {
        title: t('table:table-item-actions'),
        dataIndex: 'id',
        key: 'actions',
        align: alignRight,
        width: 100,
        render: (id: string, row: RecentOrderRow) => (
          <ActionButtons
            id={id}
            detailsUrl={Routes.order.details(id)}
            customLocale={row.language}
          />
        ),
      },
    ],
    [alignLeft, alignRight, t],
  );

  const pageSummary = paginatorInfo
    ? t('common:text-page-of-pages', {
        current: paginatorInfo.currentPage,
        last: paginatorInfo.lastPage,
      })
    : null;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg bg-white p-6 md:p-7',
        className,
      )}
      aria-label={sectionTitle}
    >
      <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between md:pb-7">
        <h3 className="before:content-'' relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
          {sectionTitle}
        </h3>
        {searchElement ? (
          <div className="w-full md:w-auto">{searchElement}</div>
        ) : null}
      </div>

      {isFetching ? (
        <>
          {/* Mobile skeleton */}
          <div className="space-y-4 lg:hidden">
            <RecentOrdersMobileSkeleton rows={5} />
          </div>
          {/* Desktop skeleton */}
          <div className="hidden lg:block">
            <RecentOrdersTableSkeleton rows={5} />
          </div>
        </>
      ) : rows.length > 0 ? (
        <>
          <div className="space-y-4 lg:hidden">
            {rows.map((row) => (
              <RecentOrdersMobileCard key={row.id} row={row} />
            ))}
          </div>

          <div className="hidden lg:block">
            <Table
              columns={columns as any}
              data={rows}
              rowKey="id"
              scroll={{ x: 980 }}
            />
          </div>
        </>
      ) : (
        <RecentOrdersEmptyState />
      )}

      {!!paginatorInfo?.total && (
        <div
          className={cn(
            'mt-5 flex flex-col gap-3 border-t border-border-100 pt-4 sm:flex-row sm:items-center sm:justify-between transition-opacity duration-200',
            isFetching && 'pointer-events-none opacity-50',
          )}
        >
          <div className="text-sm text-body">{pageSummary}</div>
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </section>
  );
};

export default RecentOrders;
