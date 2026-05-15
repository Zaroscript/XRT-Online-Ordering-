import Modal from '@/components/ui/modal/modal';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import ListItemPrice from '@/components/price/list-item-price';
import cn from 'classnames';
import { formatAddress } from '@/utils/format-address';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { transactionClient } from '@/data/client/transaction';

type TransactionDetailsModalProps = {
  transaction: any;
  transactions?: any[];
  onClose: () => void;
};

type Lifecycle = 'charge' | 'refund' | 'void' | 'failed';

function lifecycleOf(tx: any): Lifecycle {
  const txType = String(tx?.metadata?.type || '')
    .toLowerCase()
    .trim();
  const status = String(tx?.status || '')
    .toLowerCase()
    .trim();
  const amount = Number(tx?.amount || 0);
  if (txType === 'void' || status === 'voided') return 'void';
  if (txType === 'refund' || amount < 0 || status === 'refunded') return 'refund';
  if (status === 'failed') return 'failed';
  return 'charge';
}

function lifecycleLabel(kind: Lifecycle) {
  if (kind === 'void') return 'Voided';
  if (kind === 'refund') return 'Refunded';
  if (kind === 'failed') return 'Failed';
  return 'Paid';
}

type PaymentViewStatus = 'paid' | 'partially_refunded' | 'refunded' | 'failed' | 'voided';

function resolvePaymentViewStatus(
  timeline: any[],
  orderPaymentStatusRaw?: string,
): PaymentViewStatus {
  const orderPaymentStatus = String(orderPaymentStatusRaw || '')
    .toLowerCase()
    .trim();
  if (orderPaymentStatus === 'refunded') return 'refunded';
  if (orderPaymentStatus === 'partially_refunded') return 'partially_refunded';
  if (orderPaymentStatus === 'failed') return 'failed';
  if (orderPaymentStatus === 'voided') return 'voided';

  const hasRefund = timeline.some((tx) => lifecycleOf(tx) === 'refund');
  const hasVoid = timeline.some((tx) => lifecycleOf(tx) === 'void');
  const netPaid = timeline.reduce((sum, tx) => sum + Number(tx?.amount || 0), 0);
  if (hasVoid) return 'voided';
  if (hasRefund && netPaid <= 0) return 'refunded';
  if (hasRefund && netPaid > 0) return 'partially_refunded';
  const latestKind = lifecycleOf(timeline[timeline.length - 1]);
  if (latestKind === 'failed') return 'failed';
  const latestStatus = String(timeline[timeline.length - 1]?.status || '')
    .toLowerCase()
    .trim();
  if (latestStatus === 'failed') return 'failed';
  return 'paid';
}

function paymentStatusLabel(status: PaymentViewStatus) {
  if (status === 'refunded') return 'Refunded';
  if (status === 'partially_refunded') return 'Partially Refunded';
  if (status === 'failed') return 'Failed';
  if (status === 'voided') return 'Voided';
  return 'Paid';
}

function paymentStatusClasses(status: PaymentViewStatus) {
  if (status === 'refunded') return 'border-amber-300 bg-amber-100 text-amber-900';
  if (status === 'partially_refunded') return 'border-blue-200 bg-blue-50 text-blue-800';
  if (status === 'failed') return 'border-red-200 bg-red-50 text-red-700';
  if (status === 'voided') return 'border-gray-300 bg-gray-100 text-gray-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-800';
}

function containerToneClasses(status: PaymentViewStatus) {
  if (status === 'refunded') return 'bg-amber-50 ring-2 ring-amber-200';
  if (status === 'partially_refunded') return 'bg-blue-50 ring-2 ring-blue-200';
  if (status === 'failed') return 'bg-red-50 ring-2 ring-red-200';
  if (status === 'voided') return 'bg-gray-50 ring-2 ring-gray-200';
  return 'bg-white ring-1 ring-border-200';
}

function timelineClasses(kind: Lifecycle) {
  if (kind === 'refund') return 'border-amber-200 bg-amber-50/70';
  if (kind === 'void') return 'border-gray-300 bg-gray-100/70';
  if (kind === 'failed') return 'border-red-200 bg-red-50/70';
  return 'border-emerald-200 bg-emerald-50/70';
}

function statusBannerClasses(status: PaymentViewStatus) {
  if (status === 'refunded') return 'border-amber-400 bg-amber-100 text-amber-950';
  if (status === 'partially_refunded') return 'border-blue-300 bg-blue-100 text-blue-900';
  if (status === 'failed') return 'border-red-300 bg-red-100 text-red-900';
  if (status === 'voided') return 'border-gray-300 bg-gray-100 text-gray-800';
  return 'border-emerald-300 bg-emerald-100 text-emerald-900';
}

function resolveOrderId(transaction: any): string {
  return String(
    transaction?.order_id?.id ||
      transaction?.order_id?._id ||
      transaction?.order_id ||
      '',
  );
}

function roundMoney(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
}

function isMoneyEqual(a: unknown, b: unknown, tolerance = 0.01): boolean {
  return Math.abs(roundMoney(a) - roundMoney(b)) <= tolerance;
}

function resolveAddress(order: any, customer: any) {
  const deliveryAddress = formatAddress(order?.delivery?.address);
  const customerAddress = formatAddress(customer?.address);
  if (order?.order_type === 'delivery') {
    return deliveryAddress || customerAddress || 'N/A';
  }
  return customerAddress || deliveryAddress || 'Pickup / No delivery address required';
}

const TransactionDetailsModal = ({
  transaction,
  transactions = [],
  onClose,
}: TransactionDetailsModalProps) => {
  const { t } = useTranslation();
  const order = transaction.order_id || {};
  const customer = transaction.customer_id || {};
  const orderId = resolveOrderId(transaction);

  const { data: liveTransactionsResult } = useQuery({
    queryKey: [API_ENDPOINTS.TRANSACTIONS, 'modal-order-transactions', orderId],
    queryFn: () =>
      transactionClient.getList({
        order_id: orderId,
        page: 1,
        limit: 100,
      }),
    enabled: !!orderId,
    staleTime: 0,
  });

  const livePayload = (liveTransactionsResult as any)?.data ?? liveTransactionsResult;
  const liveTransactions = Array.isArray(livePayload?.data) ? livePayload.data : [];
  const timelineSource = liveTransactions.length
    ? liveTransactions
    : transactions.length
      ? transactions
      : [transaction];
  const timeline = timelineSource.slice().sort(
    (a, b) =>
      new Date(a?.created_at || 0).getTime() - new Date(b?.created_at || 0).getTime(),
  );

  const netPaid = timeline.reduce((sum, tx) => sum + Number(tx?.amount || 0), 0);
  const hasRefund = timeline.some((tx) => lifecycleOf(tx) === 'refund');
  const chargeTx = timeline.find((tx) => lifecycleOf(tx) === 'charge');
  const chargedAmount = Number(
    order?.money?.gateway_captured_amount ??
      chargeTx?.amount ??
      order?.money?.total_amount ??
      0,
  );
  const refundedAmount = timeline.reduce((sum, tx) => {
    return lifecycleOf(tx) === 'refund' ? sum + Math.abs(Number(tx?.amount || 0)) : sum;
  }, 0);
  const viewStatus = resolvePaymentViewStatus(
    timeline,
    order?.money?.payment_status || order?.payment_status || transaction?.paymentStatus,
  );
  const resolvedAddress = resolveAddress(order, customer);
  const money = order?.money ?? {};
  const subtotal = Number(money?.subtotal ?? money?.items_total ?? 0);
  const tax = Number(money?.tax_total ?? money?.taxAmount ?? money?.tax ?? 0);
  const tip = Number(money?.tips ?? money?.tipAmount ?? money?.tip ?? 0);
  const deliveryFee = Number(money?.delivery_fee ?? money?.deliveryFee ?? 0);
  const discount = Math.abs(Number(money?.discount ?? 0));
  const grossTotalDisplay = Number(
    money?.total_amount ?? money?.grandTotal ?? money?.total ?? transaction?.amount ?? 0,
  );
  const netTotalDisplay = Number(money?.net_paid_amount ?? netPaid ?? 0);
  const reconciledGrossTotal = roundMoney(subtotal + tax + tip + deliveryFee - discount);
  const reconciledNetTotal = roundMoney(reconciledGrossTotal - refundedAmount);
  const hasDiscountOrRefundAdjustments = discount > 0 || refundedAmount > 0;
  const isGrossConsistent = isMoneyEqual(grossTotalDisplay, reconciledGrossTotal);
  const isNetConsistent =
    isMoneyEqual(netTotalDisplay, reconciledNetTotal) ||
    isMoneyEqual(netPaid, reconciledNetTotal);
  const hasTotalMismatch = hasDiscountOrRefundAdjustments
    ? !isGrossConsistent && !isNetConsistent
    : !isGrossConsistent;
  const showAdjustedTotalsNote = hasDiscountOrRefundAdjustments || hasTotalMismatch;

  useEffect(() => {
    if (!hasTotalMismatch || process.env.NODE_ENV === 'production') return;
    console.warn('[OrderHistory] Totals mismatch detected', {
      orderId: order?.id || order?._id || transaction?.order_id,
      orderNumber: order?.order_number,
      subtotal,
      tax,
      tip,
      deliveryFee,
      discount,
      refundedAmount,
      reconciledGrossTotal,
      reconciledNetTotal,
      grossTotal: grossTotalDisplay,
      netTotal: netTotalDisplay,
    });
  }, [
    hasTotalMismatch,
    order?.id,
    order?._id,
    order?.order_number,
    transaction?.order_id,
    subtotal,
    tax,
    tip,
    deliveryFee,
    discount,
    refundedAmount,
    reconciledGrossTotal,
    reconciledNetTotal,
    grossTotalDisplay,
    netTotalDisplay,
  ]);

  return (
    <Modal open={true} onClose={onClose}>
      <div
        className={cn(
          'relative z-10 p-6 md:p-8 w-full max-w-4xl overflow-hidden rounded-xl shadow-xl',
          containerToneClasses(viewStatus),
        )}
      >
        <div
          className={cn(
            'mb-4 rounded-lg border px-4 py-3 text-sm font-semibold',
            statusBannerClasses(viewStatus),
          )}
        >
          {paymentStatusLabel(viewStatus)}
          {hasRefund ? ' payment applied' : ' payment'}
          {order.order_number ? ` · #${order.order_number}` : ''}
        </div>
        <div className="mb-4">
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              paymentStatusClasses(viewStatus),
            )}
          >
            {paymentStatusLabel(viewStatus)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-6 border-b border-border-200 pb-4">
          <h2 className="text-xl font-bold text-heading">
            {t('common:text-transaction-details')} - {order.order_number || 'N/A'}
          </h2>
          <button onClick={onClose} className="text-body hover:text-accent">
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order & Payment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-heading border-b border-border-200 pb-2">
              {t('common:order-info')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-body">Status:</span>
              <span className="font-medium text-heading">{paymentStatusLabel(viewStatus)}</span>

              <span className="text-body">{t('table:table-item-placed-at')}:</span>
              <span className="font-medium text-heading">
                {dayjs(transaction.created_at).format('MM/DD/YYYY HH:mm')}
              </span>

              <span className="text-body">Gateway:</span>
              <span className="font-medium text-heading uppercase">{transaction.gateway}</span>

              <span className="text-body">{t('table:table-item-payment-method')}:</span>
              <span className="font-medium text-heading capitalize">
                {transaction.card_type ? `${transaction.card_type} ${transaction.last_4 ? `**** ${transaction.last_4}` : ''}` : (transaction.payment_method || transaction.gateway)}
              </span>
              
              <span className="text-body">{t('common:text-gateway-id')}:</span>
              <span className="font-medium text-heading truncate">{transaction.transaction_id}</span>

              <span className="text-body">Order ID:</span>
              <span className="font-medium text-heading">
                {order?.order_number || order?.id || order?._id || 'N/A'}
              </span>

              <span className="text-body">Charged Amount:</span>
              <span className="font-medium text-heading">
                <ListItemPrice value={chargedAmount} />
              </span>

              <span className="text-body">Refunded Amount:</span>
              <span className="font-medium text-heading">
                <ListItemPrice value={refundedAmount} />
              </span>

              <span className="text-body">Net Paid:</span>
              <span className="font-medium text-heading">
                <ListItemPrice value={netPaid} />
              </span>

              <span className="text-body">Date / Time:</span>
              <span className="font-medium text-heading">
                {dayjs(transaction.created_at).format('MM/DD/YYYY HH:mm')}
              </span>

              {transaction?.metadata?.reason || transaction?.metadata?.notes ? (
                <>
                  <span className="text-body">Notes:</span>
                  <span className="font-medium text-heading">
                    {transaction?.metadata?.reason || transaction?.metadata?.notes}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-heading border-b border-border-200 pb-2">
              {t('common:customer-info')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-body">{t('table:table-item-customer-name')}:</span>
              <span className="font-medium text-heading">{customer.name || 'Guest'}</span>

              <span className="text-body">{t('common:text-email')}:</span>
              <span className="font-medium text-heading">{customer.email || 'N/A'}</span>

              <span className="text-body">{t('table:table-item-phone')}:</span>
              <span className="font-medium text-heading">{customer.phoneNumber || order.delivery?.phone || 'N/A'}</span>

              <span className="text-body">{t('common:text-address')}:</span>
              <span className="font-medium text-heading">
                {resolvedAddress}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-border-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-heading mb-4">Payment Timeline</h3>
          <div className="space-y-3">
            {timeline.map((tx: any) => {
              const kind = lifecycleOf(tx);
              return (
                <div
                  key={tx?.id || tx?.transaction_id}
                  className={cn(
                    'rounded-lg border px-4 py-3',
                    timelineClasses(kind),
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-heading">
                      {lifecycleLabel(kind)} Completed
                    </div>
                    <div className="text-xs text-body">
                      {dayjs(tx?.created_at).format('MM/DD/YYYY HH:mm')}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-body">Gateway ID: </span>
                      <span className="font-medium text-heading break-all">
                        {tx?.transaction_id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-body">
                        {kind === 'charge' ? 'Amount: ' : 'Refunded Amount: '}
                      </span>
                      <span className="font-medium text-heading">
                        <ListItemPrice value={tx?.amount || 0} />
                      </span>
                    </div>
                    <div>
                      <span className="text-body">Status: </span>
                      <span className="font-medium text-heading">
                        {lifecycleLabel(kind)}
                      </span>
                    </div>
                    {tx?.metadata?.reason ? (
                      <div>
                        <span className="text-body">Reason: </span>
                        <span className="font-medium text-heading">{tx.metadata.reason}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border-200 pt-3 text-right">
            <span className="text-sm text-body">Net Paid: </span>
            <span className="text-lg font-bold text-heading">
              <ListItemPrice value={netPaid} />
            </span>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-heading mb-4">{t('common:order-totals')}</h3>
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>{t('table:table-item-total-items-value')}</span>
              <ListItemPrice value={subtotal} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-tax')}</span>
              <ListItemPrice value={tax} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-tip')}</span>
              <ListItemPrice value={tip} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-delivery-fee')}</span>
              <ListItemPrice value={deliveryFee} />
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>
                  {money?.coupon_code
                    ? `${t('common:text-coupon')} (${money.coupon_code})`
                    : t('common:text-discount', 'Discount')}
                </span>
                <ListItemPrice value={-discount} />
              </div>
            )}
            {money?.rewards_points_used > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>{t('common:text-rewards-used')}</span>
                <span>-{money.rewards_points_used} pts</span>
              </div>
            )}
            <div
              className={cn(
                'flex justify-between border-t border-border-200 pt-2 font-bold text-lg',
                viewStatus === 'refunded' ? 'text-amber-900' : 'text-heading'
              )}
            >
              <span>{t('table:table-item-total')}</span>
              <ListItemPrice value={grossTotalDisplay} />
            </div>
            <div className="flex justify-between text-xs text-body">
              <span>Net Paid</span>
              <ListItemPrice value={netTotalDisplay} />
            </div>
            {showAdjustedTotalsNote ? (
              <div className="pt-1 text-right text-[11px] text-body">
                Totals adjusted by discounts/refunds.
              </div>
            ) : null}
          </div>
        </div>

        {/* Items Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-heading mb-4">{t('common:order-items')}</h3>
          <div className="border border-border-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-heading font-semibold">
                <tr>
                  <th className="py-2 px-4 text-left font-semibold">Item</th>
                  <th className="py-2 px-4 text-center font-semibold">Qty</th>
                  <th className="py-2 px-4 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-t border-border-200">
                    <td className="py-2 px-4">
                      <div className="font-medium text-heading">{item.name_snap}</div>
                      {item.size_snap && <div className="text-xs text-body italic">{item.size_snap}</div>}
                    </td>
                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-right">
                      <ListItemPrice value={item.line_subtotal || (item.unit_price * item.quantity)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
