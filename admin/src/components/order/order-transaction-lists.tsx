import Pagination from '@/components/ui/pagination';
import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import ListItemPrice from '@/components/price/list-item-price';
import { formatAddress } from '@/utils/format-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { SortOrder, UserAddress } from '@/types';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Order, MappedPaginatorInfo } from '@/types';
import { useRouter } from 'next/router';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import { Routes } from '@/config/routes';
import { Eye } from '@/components/icons/eye-icon';
import { ChatIcon } from '@/components/icons/chat';
import { useCreateConversations } from '@/data/conversations';
import { SUPER_ADMIN } from '@/utils/constants';
import { getAuthCredentials } from '@/utils/auth-utils';
import { NoDataFound } from '@/components/icons/no-data-found';
import TransactionDetailsModal from './transaction-details-modal';
import { useModalAction } from '@/components/ui/modal/modal.context';

type IProps = {
  transactions: any[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
};

/** Compact stroke icon for refund action (avoids large marketing SVG). */
const RefundStrokeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 12a9 9 0 1 0 3-7.1" />
    <path d="M3 4v5h5" />
  </svg>
);

const OrderTransactionList = ({
  transactions,
  paginatorInfo,
  onPagination,
}: IProps) => {
  // const { data, paginatorInfo } = orders! ?? {};
  const router = useRouter();
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation('common');

  const isRefundTransaction = (record: any) =>
    Number(record?.amount) < 0 || record?.metadata?.type === 'refund';

  const rowExpandable = (record: any) => record?.children?.length;
  const { alignLeft, alignRight } = useIsRTL();
  const { permissions } = getAuthCredentials();
  const { mutate: createConversations, isPending: creating } =
    useCreateConversations();
  const [loading, setLoading] = useState<boolean | string | undefined>(false);
  const { openModal } = useModalAction();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const columns = [
    {
      title: t('table:table-item-order-number'),
      dataIndex: 'order_id',
      key: 'order_number',
      align: 'center',
      render: (order: any) => order?.order_number || 'N/A',
    },
    {
      title: t('table:table-item-placed-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date: string) => dayjs(date).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: t('table:table-item-customer-name'),
      dataIndex: 'customer_id',
      key: 'customer_name',
      align: alignLeft,
      render: (customer: any) => customer?.name || 'Guest',
    },
    {
      title: t('table:table-item-total-items-value'),
      dataIndex: 'order_id',
      key: 'subtotal',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.subtotal} />,
    },
    {
      title: t('table:table-item-tax'),
      dataIndex: 'order_id',
      key: 'tax',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.tax_total} />,
    },
    {
      title: t('table:table-item-tip'),
      dataIndex: 'order_id',
      key: 'tip',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.tips} />,
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (amount: number, record: any) => {
        const refund = isRefundTransaction(record);
        return (
          <span className={cn(refund && 'font-semibold text-amber-800')}>
            <ListItemPrice value={amount} />
          </span>
        );
      },
    },
    {
      title: tCommon('text-transaction-kind'),
      key: 'transaction_kind',
      align: 'center',
      render: (_: unknown, record: any) => {
        const refund = isRefundTransaction(record);
        return (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              refund
                ? 'border-amber-400 bg-amber-100 text-amber-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            )}
          >
            {refund
              ? tCommon('text-transaction-kind-refund')
              : tCommon('text-transaction-kind-charge')}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-order-type'),
      dataIndex: 'order_id',
      key: 'order_type',
      align: 'center',
      render: (order: any) => (
        <span className="capitalize">{order?.order_type || 'N/A'}</span>
      ),
    },
    {
      title: t('table:table-item-payment-method'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: (method: string, record: any) => (
        <span className="capitalize">
          {record.card_type} {record.last_4 ? `**** ${record.last_4}` : method}
        </span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      render: (id: string, record: any) => {
        const orderMoney = record?.order_id?.money;
        const orderPaymentStatus =
          orderMoney?.payment_status ||
          record?.order_id?.payment_status ||
          record?.payment_status ||
          record?.money?.payment_status;

        const refundRow = isRefundTransaction(record);
        const orderFullyRefunded = orderPaymentStatus === 'refunded';

        /** Refund only from the original charge row (positive amount), never from a refund line */
        const isChargeRow =
          !refundRow && Number(record?.amount) > 0 && record?.status === 'completed';

        const isNmiGateway = String(record?.gateway || '').toLowerCase() === 'nmi';

        const canRefund =
          isChargeRow &&
          !isNmiGateway &&
          !orderFullyRefunded &&
          (orderPaymentStatus === 'paid' || orderPaymentStatus === 'partially_refunded') &&
          record?.status !== 'failed' &&
          record?.status !== 'pending';

        const totalAmount =
          orderMoney?.total_amount ??
          record?.money?.total_amount ??
          record?.amount ??
          record?.total ??
          0;

        const actualOrderId =
          record?.order_id?.id || record?.order_id?._id || record?.order_id || record?.id;

        return (
          <div className="flex flex-col items-end gap-1">
            {orderFullyRefunded && !refundRow && (
              <span className="max-w-[160px] text-end text-[10px] leading-tight text-amber-800">
                {tCommon('text-order-fully-refunded-no-refund')}
              </span>
            )}
            <div className="inline-flex items-center justify-end gap-0.5">
              {canRefund && (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                  title={tCommon('text-tooltip-refund')}
                  aria-label={tCommon('text-tooltip-refund')}
                  onClick={() =>
                    openModal('REFUND_ORDER', { orderId: actualOrderId, totalAmount })
                  }
                >
                  <RefundStrokeIcon className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                title={tCommon('text-show-more')}
                aria-label={tCommon('text-show-more')}
                onClick={() => setSelectedTransaction(record)}
              >
                <Eye className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-x-auto rounded-lg border border-border-200 bg-white shadow-sm">
        <Table
          //@ts-ignore
          columns={columns}
          rowClassName={(record: any) =>
            isRefundTransaction(record)
              ? '!bg-amber-50/90 hover:!bg-amber-100/90 [&>td]:border-l-4 [&>td]:border-l-amber-500 [&>td:first-child]:border-l-amber-500'
              : ''
          }
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={transactions}
          rowKey="id"
          scroll={{ x: 1080 }}
        />
      </div>

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderTransactionList;
