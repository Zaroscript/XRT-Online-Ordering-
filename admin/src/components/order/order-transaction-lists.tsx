import Pagination from '@/components/ui/pagination';
import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import ListItemPrice from '@/components/price/list-item-price';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import { MappedPaginatorInfo } from '@/types';
import { Eye } from '@/components/icons/eye-icon';
import { NoDataFound } from '@/components/icons/no-data-found';
import TransactionDetailsModal from './transaction-details-modal';
import { useModalAction } from '@/components/ui/modal/modal.context';

type IProps = {
  transactions: any[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
};

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

type PaymentStatus =
  | 'charge'
  | 'partially_refunded'
  | 'refunded'
  | 'voided'
  | 'failed'
  | 'pending';

function resolvePaymentStatus(record: any): PaymentStatus {
  const lifecycleState = String(record?.lifecycleState || record?.lifecycle_state || '')
    .toLowerCase()
    .trim();
  if (
    lifecycleState === 'charge' ||
    lifecycleState === 'partially_refunded' ||
    lifecycleState === 'refunded' ||
    lifecycleState === 'voided' ||
    lifecycleState === 'failed' ||
    lifecycleState === 'pending'
  ) {
    return lifecycleState as PaymentStatus;
  }

  const orderPaymentStatus = String(
    record?.paymentStatus ||
      record?.payment_status ||
      record?.order_id?.money?.payment_status ||
      record?.order_id?.payment_status ||
      '',
  )
    .toLowerCase()
    .trim();
  const txStatus = String(record?.status || '')
    .toLowerCase()
    .trim();
  const txType = String(record?.metadata?.type || '')
    .toLowerCase()
    .trim();

  if (txType === 'void' || txStatus === 'voided') return 'voided';
  if (orderPaymentStatus === 'refunded' || txStatus === 'refunded') return 'refunded';
  if (orderPaymentStatus === 'partially_refunded') return 'partially_refunded';
  if (txStatus === 'failed' || orderPaymentStatus === 'failed') return 'failed';
  if (txStatus === 'pending' || orderPaymentStatus === 'pending') return 'pending';
  return 'charge';
}

function paymentStatusLabel(kind: PaymentStatus) {
  switch (kind) {
    case 'voided':
      return 'Voided';
    case 'refunded':
      return 'Refunded';
    case 'partially_refunded':
      return 'Partially Refunded';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    default:
      return 'Charge';
  }
}

function paymentStatusClasses(kind: PaymentStatus) {
  switch (kind) {
    case 'voided':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'refunded':
      return 'border-amber-300 bg-amber-100 text-amber-900';
    case 'partially_refunded':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'failed':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'pending':
      return 'border-gray-200 bg-gray-50 text-gray-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }
}

function getOrderId(record: any): string {
  return String(
    record?.order_id?.id || record?.order_id?._id || record?.order_id || '',
  );
}

function resolveMoneyValue(record: any, candidates: string[]): number {
  const orderMoney = record?.order_id?.money ?? {};
  for (const key of candidates) {
    const direct = orderMoney?.[key];
    if (direct !== undefined && direct !== null) return Number(direct) || 0;
  }
  return 0;
}

function summarizeOrderFinancials(
  orderId: string,
  allTransactions: any[] | undefined,
  fallbackTotalAmount: number,
) {
  const siblings = Array.isArray(allTransactions)
    ? allTransactions.filter((tx) => getOrderId(tx) === String(orderId))
    : [];

  const refundedAmount = siblings.reduce((sum, tx) => {
    const txType = String(tx?.metadata?.type || '').toLowerCase().trim();
    const txAmount = Number(tx?.amount || 0);
    if (txType === 'refund' || txAmount < 0) return sum + Math.abs(txAmount);
    return sum;
  }, 0);

  const orderTotal =
    Number(
      siblings[0]?.order_id?.money?.total_amount ??
        fallbackTotalAmount,
    ) || 0;
  const remainingAmount = Math.max(0, orderTotal - refundedAmount);
  return { refundedAmount, remainingAmount, orderTotal };
}

const OrderTransactionList = ({
  transactions,
  paginatorInfo,
  onPagination,
}: IProps) => {
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation('common');
  const { alignLeft } = useIsRTL();
  const { openModal } = useModalAction();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedOrderTransactions, setSelectedOrderTransactions] = useState<any[]>(
    [],
  );

  const columns = [
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
      key: 'subtotal',
      align: 'center',
      render: (_: number, record: any) => (
        <ListItemPrice
          value={resolveMoneyValue(record, ['subtotal', 'items_total', 'sub_total'])}
        />
      ),
    },
    {
      title: t('table:table-item-tax'),
      key: 'tax',
      align: 'center',
      render: (_: number, record: any) => (
        <ListItemPrice value={resolveMoneyValue(record, ['tax_total', 'taxAmount', 'tax'])} />
      ),
    },
    {
      title: t('table:table-item-tip'),
      key: 'tip',
      align: 'center',
      render: (_: number, record: any) => (
        <ListItemPrice value={resolveMoneyValue(record, ['tips', 'tipAmount', 'tip'])} />
      ),
    },
    {
      title: t('table:table-item-total'),
      key: 'amount',
      align: 'center',
      render: (_amount: number, record: any) => (
        <ListItemPrice
          value={resolveMoneyValue(record, ['total_amount', 'grandTotal', 'total']) || Number(record?.amount || 0)}
        />
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
      title: 'Payment Status',
      key: 'payment_status',
      align: 'center',
      render: (_: unknown, record: any) => {
        const status = resolvePaymentStatus(record);
        return (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              paymentStatusClasses(status),
            )}
          >
            {paymentStatusLabel(status)}
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
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      render: (_id: string, record: any) => {
        const status = resolvePaymentStatus(record);
        const isPaymentEventRow = Number(record?.amount) > 0;
        const isChargeRow = isPaymentEventRow && String(record?.status || '').toLowerCase() === 'completed';
        const isNmiGateway = String(record?.gateway || '').toLowerCase() === 'nmi';
        const orderId = getOrderId(record);
        const totalAmount =
          Number(record?.order_id?.money?.total_amount ?? record?.amount ?? 0) || 0;
        const summary = summarizeOrderFinancials(orderId, transactions, totalAmount);
        const refundedAmount = Number(record?.refundedAmount ?? summary.refundedAmount);
        const remainingAmount = Number(record?.refundableAmount ?? summary.remainingAmount);
        const isClosedState = status === 'refunded' || status === 'voided';
        const canRefund =
          isChargeRow &&
          !isNmiGateway &&
          !isClosedState &&
          remainingAmount > 0;
        const txSettlementStatus = String(
          record?.metadata?.authorizeNetTransactionStatus || '',
        )
          .toLowerCase()
          .trim();
        const shouldVoid =
          txSettlementStatus === 'authorizedpendingcapture' ||
          txSettlementStatus === 'capturedpendingsettlement' ||
          txSettlementStatus === 'pendingsettlement' ||
          status === 'pending';
        const refundTooltip =
          status === 'partially_refunded'
            ? `$${refundedAmount.toFixed(2)} refunded / $${remainingAmount.toFixed(2)} remaining`
            : shouldVoid
              ? 'Void Payment'
              : 'Refund Order';

        const actualOrderId = orderId || record?.id;
        const actualTrackingNumber =
          record?.order_id?.order_number ||
          record?.order_number ||
          record?.order_id?.tracking_number ||
          record?.tracking_number;

        return (
          <div className="inline-flex items-center justify-end gap-1">
              {canRefund && (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                  title={refundTooltip}
                  aria-label={refundTooltip}
                  onClick={() =>
                    openModal('REFUND_ORDER', {
                      orderId: actualOrderId,
                      totalAmount,
                      trackingNumber: actualTrackingNumber,
                      preferredAction: shouldVoid ? 'void' : 'refund',
                    })
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
                onClick={() => {
                  const siblings = Array.isArray(transactions)
                    ? transactions
                        .filter((tx: any) => {
                          return String(getOrderId(tx)) === String(orderId);
                        })
                        .sort(
                          (a: any, b: any) =>
                            new Date(a?.created_at || 0).getTime() -
                            new Date(b?.created_at || 0).getTime(),
                        )
                    : [];
                  setSelectedOrderTransactions(siblings);
                  setSelectedTransaction(record);
                }}
              >
                <Eye className="h-[18px] w-[18px]" />
              </button>
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
          scroll={{ x: 1260 }}
        />
      </div>

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          transactions={selectedOrderTransactions}
          onClose={() => {
            setSelectedTransaction(null);
            setSelectedOrderTransactions([]);
          }}
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
