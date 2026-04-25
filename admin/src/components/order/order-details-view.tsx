import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import cn from 'classnames';
import { toast } from 'react-toastify';
import OrderItemsTable from '@/components/order/details/order-items-table';
import OrderSummary from '@/components/order/details/order-summary';
import CustomerDetails from '@/components/order/details/customer-details';
import OrderInfo from '@/components/order/details/order-info';
import {
  getOrderStatusColors,
  getOrderStatusLabelKey,
  isScheduledOrder,
  useOrderQuery,
  useUpdateOrderMutation,
  useReprintOrderMutation,
} from '@/data/order';
import { useModalAction } from '@/components/ui/modal/modal.context';
import usePrice from '@/utils/use-price';
import { formatOrderDisplayValue } from '@/utils/order-display';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';
import { Order } from '@/types';
import { orderClient } from '@/data/client/order';
import { useIsRTL } from '@/utils/locals';

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderDetailsViewProps {
  orderId: string;
  initialOrder?: Order | null;
  onClose?: () => void;
}

type ServerStatus =
  | 'pending'
  | 'accepted'
  | 'inkitchen'
  | 'ready'
  | 'out of delivery'
  | 'completed'
  | 'canceled';

// ─── Status Flow Config ──────────────────────────────────────────────────────

const DELIVERY_FLOW: ServerStatus[] = [
  'pending',
  'accepted',
  'inkitchen',
  'ready',
  'out of delivery',
  'completed',
];
const PICKUP_FLOW: ServerStatus[] = [
  'pending',
  'accepted',
  'inkitchen',
  'ready',
  'completed',
];

const STEP_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  inkitchen: 'In Kitchen',
  ready: 'Ready',
  'out of delivery': 'Out for Delivery',
  completed: 'Completed',
  canceled: 'Cancelled',
};

const NEXT_BUTTON_LABEL: Record<string, string> = {
  pending: 'Accept Order',
  accepted: 'Send to Kitchen',
  inkitchen: 'Mark Ready',
  ready: 'Complete Order', // overridden for delivery
  'out of delivery': 'Complete Order',
};

/** Resolve the raw server status string from the order object */
function getServerStatus(order: Order): ServerStatus {
  const raw = String(
    (order as any)?.status ?? order?.order_status ?? 'pending',
  )
    .toLowerCase()
    .trim();
  return raw as ServerStatus;
}

/** Determine if the order is for delivery */
function isDelivery(order: Order): boolean {
  const t = String(order?.order_type ?? '').toLowerCase();
  return t === 'delivery';
}

/** Get the next status in the flow */
function getNextStatus(current: ServerStatus, delivery: boolean): ServerStatus | null {
  const flow = delivery ? DELIVERY_FLOW : PICKUP_FLOW;
  const idx = flow.indexOf(current);
  if (idx === -1 || idx >= flow.length - 1) return null;
  return flow[idx + 1];
}

// ─── Helper Utils ────────────────────────────────────────────────────────────

function getOrderQuantity(order?: Order | null) {
  return (order?.products ?? []).reduce(
    (total, product) =>
      total + Number(product?.pivot?.order_quantity ?? product?.quantity ?? 0),
    0,
  );
}

function formatDetailDate(value?: string | null) {
  if (!value) return 'N/A';
  const d = dayjs(value);
  return d.isValid() ? d.format('MMM D, YYYY h:mm A') : 'N/A';
}

// ─── UI Primitives ───────────────────────────────────────────────────────────

const DetailState = ({
  title,
  description,
  tone = 'default',
}: {
  title: string;
  description: string;
  tone?: 'default' | 'error';
}) => (
  <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
    <div
      className={cn(
        'w-full max-w-md rounded-2xl border px-6 py-8 text-center shadow-sm',
        tone === 'error'
          ? 'border-red-100 bg-red-50/60'
          : 'border-border-200 bg-white',
      )}
    >
      <div
        className={cn(
          'mx-auto mb-4 h-12 w-12 rounded-full border-4',
          tone === 'error'
            ? 'border-red-200 bg-red-100'
            : 'animate-spin border-gray-200 border-t-accent',
        )}
      />
      <h3 className="text-lg font-semibold text-heading">{title}</h3>
      <p className="mt-2 text-sm text-body">{description}</p>
    </div>
  </div>
);

const DetailStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border-200 bg-gray-50/80 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-body/70">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-heading">{value}</p>
  </div>
);

// ─── Status Stepper ──────────────────────────────────────────────────────────

function StatusStepper({
  current,
  delivery,
  canceled,
}: {
  current: ServerStatus;
  delivery: boolean;
  canceled: boolean;
}) {
  const flow = delivery ? DELIVERY_FLOW : PICKUP_FLOW;
  const currentIdx = flow.indexOf(current);

  if (canceled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-sm font-semibold text-red-600">
          Order Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {flow.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isUpcoming = i > currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-7 w-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all',
                  isDone &&
                    'border-emerald-500 bg-emerald-500 text-white',
                  isActive &&
                    'border-accent bg-accent text-white shadow-md shadow-accent/30',
                  isUpcoming &&
                    'border-gray-200 bg-white text-gray-400',
                )}
              >
                {isDone ? (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider',
                  isDone && 'text-emerald-600',
                  isActive && 'text-accent',
                  isUpcoming && 'text-gray-400',
                )}
              >
                {STEP_LABELS[step] || step}
              </span>
            </div>
            {i < flow.length - 1 && (
              <div
                className={cn(
                  'mx-1 mb-5 h-0.5 w-6 sm:w-10 flex-shrink-0 rounded-full transition-all',
                  i < currentIdx ? 'bg-emerald-400' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Action Buttons ──────────────────────────────────────────────────────────

function ActionBar({
  order,
  serverStatus,
  isUpdating,
  isReprinting,
  isDownloading,
  onAdvance,
  onCancel,
  onRefund,
  onReprint,
  onDownloadInvoice,
}: {
  order: Order;
  serverStatus: ServerStatus;
  isUpdating: boolean;
  isReprinting: boolean;
  isDownloading: boolean;
  onAdvance: () => void;
  onCancel: () => void;
  onRefund: () => void;
  onReprint: () => void;
  onDownloadInvoice: () => void;
}) {
  const { t } = useTranslation('common');
  const delivery = isDelivery(order);
  const nextStatus = getNextStatus(serverStatus, delivery);

  const isCanceled =
    serverStatus === 'canceled' || serverStatus === 'cancelled';
  const isCompleted = serverStatus === 'completed';
  const isTerminal = isCanceled || isCompleted;

  const rawPaymentStatus = String(
    (order as any)?.money?.payment_status ||
      order?.payment_status ||
      '',
  ).toLowerCase();
  const isRefundable =
    !isTerminal &&
    (rawPaymentStatus === 'paid' ||
      rawPaymentStatus === 'partially_refunded' ||
      rawPaymentStatus === 'pending') &&
    rawPaymentStatus !== 'refunded';
  const isAlreadyRefunded = rawPaymentStatus === 'refunded';
  const refundButtonLabel = rawPaymentStatus === 'pending' ? 'Void Payment' : 'Refund Order';

  const nextLabel =
    delivery && serverStatus === 'ready'
      ? 'Out for Delivery'
      : NEXT_BUTTON_LABEL[serverStatus] ?? null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary: advance status */}
      {nextStatus && nextLabel && (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isUpdating}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-1',
            isUpdating && 'cursor-not-allowed opacity-50',
          )}
        >
          {isUpdating ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : null}
          {nextLabel}
        </button>
      )}

      {/* Refund */}
      {isRefundable && (
        <button
          type="button"
          onClick={onRefund}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1"
        >
          {refundButtonLabel}
        </button>
      )}

      {/* Cancel */}
      {!isTerminal && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isUpdating}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1',
            isUpdating && 'cursor-not-allowed opacity-50',
          )}
        >
          {t('text-cancel-order')}
        </button>
      )}

      {/* Reprint */}
      <button
        type="button"
        onClick={onReprint}
        disabled={isReprinting}
        title="Reprint order to kitchen printer"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-body transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1',
          isReprinting && 'cursor-not-allowed opacity-50',
        )}
      >
        {isReprinting ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
        )}
        Reprint
      </button>

      {/* Invoice */}
      <button
        type="button"
        onClick={onDownloadInvoice}
        disabled={isDownloading}
        title="Download invoice PDF"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-body transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1',
          isDownloading && 'cursor-not-allowed opacity-50',
        )}
      >
        {isDownloading ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        Invoice
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OrderDetailsView({
  orderId,
  initialOrder,
  onClose,
}: OrderDetailsViewProps) {
  const { t } = useTranslation(['common', 'form']);
  const { locale } = useRouter();
  const { isRTL } = useIsRTL();
  const [isDownloading, setIsDownloading] = useState(false);

  const { mutateAsync: updateOrderAsync, isPending: isUpdating } =
    useUpdateOrderMutation();
  const { mutate: reprintOrder, isPending: isReprinting } =
    useReprintOrderMutation();
  const { openModal } = useModalAction();

  const {
    order: liveOrder,
    isLoading,
    isFetching,
    error,
  } = useOrderQuery(
    {
      id: orderId,
      language: locale ?? 'en',
    },
    {
      enabled: Boolean(orderId),
      initialData: initialOrder ?? undefined,
    },
  );

  const order = liveOrder ?? initialOrder ?? null;

  const { price: totalAmountLabel } = usePrice({
    amount:
      order?.money?.total_amount ?? order?.total ?? order?.paid_total ?? 0,
  });

  // ─── Guard States ──────────────────────────────────────────────────────────
  if (isLoading && !order) {
    return (
      <DetailState
        title={t('common:text-loading')}
        description="Fetching order details…"
      />
    );
  }
  if (error && !order) {
    return (
      <DetailState
        title="Something went wrong"
        description={error.message}
        tone="error"
      />
    );
  }
  if (!order) {
    return (
      <DetailState
        title={t('common:no-order-found')}
        description="This order could not be found."
        tone="error"
      />
    );
  }

  // ─── Derived State ─────────────────────────────────────────────────────────
  const serverStatus = getServerStatus(order);
  const scheduled = isScheduledOrder(order);
  const delivery = isDelivery(order);

  const isCanceled =
    serverStatus === 'canceled' || serverStatus === ('cancelled' as any);
  const isCompleted = serverStatus === 'completed';
  const isTerminal = isCanceled || isCompleted;

  const statusLabel = String(order.order_status ?? '');
  const colors = getOrderStatusColors(statusLabel, scheduled);
  const trackingLabel = formatOrderTrackingLabel(order.tracking_number);
  const paymentStatusLabel = formatOrderDisplayValue(order.payment_status);
  const orderTypeLabel = formatOrderDisplayValue(order.order_type);
  const itemQuantity = getOrderQuantity(order);
  const itemQuantityLabel = `${itemQuantity} ${itemQuantity === 1 ? t('common:text-item') : t('common:text-items')}`;
  const activeTimeLabel = scheduled
    ? formatDetailDate(order.schedule_time)
    : formatDetailDate((order as any)?.ready_time || order.delivery_time);
  const activeTimeTitle = scheduled
    ? t('common:text-scheduled-for')
    : t('common:text-ready-time');

  const nextStatus = getNextStatus(serverStatus, delivery);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    const readyTimeBody =
      nextStatus === 'ready' || nextStatus === 'out of delivery'
        ? { ready_time: new Date().toISOString() }
        : {};

    updateOrderAsync({
      id: String(order.id),
      status: nextStatus,
      ...readyTimeBody,
    }).catch((err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to update status',
      );
    });
  };

  const handleCancelOrder = () => {
    openModal('CONFIRM_ACTION', {
      title: t('common:text-cancel-order'),
      description: t('common:text-cancel-order-confirm'),
      deleteBtnText: t('common:text-cancel-order'),
      cancelBtnText: t('common:text-back'),
      requireReason: true,
      reasonLabel: 'text-cancel-reason',
      reasonPlaceholder: 'text-cancel-reason-placeholder',
      onConfirm: (reason: string) =>
        updateOrderAsync({
          id: String(order.id),
          status: 'canceled',
          cancelled_reason: reason,
        }),
      onSuccess: onClose,
    });
  };

  const handleRefund = () => {
    const paymentStatus = String(
      (order as any)?.money?.payment_status || order?.payment_status || '',
    ).toLowerCase();
    openModal('REFUND_ORDER', {
      orderId: order?.id,
      totalAmount:
        (order as any)?.money?.total_amount ?? order?.total ?? order?.paid_total,
      trackingNumber: order?.tracking_number,
      preferredAction: paymentStatus === 'pending' ? 'void' : 'refund',
    });
  };

  const handleReprint = () => {
    reprintOrder({ id: String(order.id) });
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const url = await orderClient.downloadInvoice({
        order_id: String(order.id),
        is_rtl: isRTL,
        language: locale ?? 'en',
        translated_text: {
          subtotal: t('common:order-sub-total'),
          discount: t('common:order-discount'),
          tax: t('common:order-tax'),
          delivery_fee: t('common:order-delivery-fee'),
          total: t('common:order-total'),
          products: t('common:text-products'),
          quantity: t('common:text-quantity'),
          invoice_no: t('common:text-invoice-no'),
          date: t('common:text-date'),
          paid_from_wallet: t('common:text-paid_from_wallet'),
          amount_due: t('common:text-amount-due'),
        },
      });
      if (url) window.open(url as any, '_blank');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-[95vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-6 py-6 shadow-sm">
        {/* Title row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {/* Status + Payment badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
                  colors.badge,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
                {t(`common:${getOrderStatusLabelKey(statusLabel, scheduled)}`)}
              </span>
              <span className="rounded-full border border-accent/15 bg-accent/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                {paymentStatusLabel}
              </span>
              {isFetching && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-body/60">
                  Syncing…
                </span>
              )}
            </div>

            {/* Order # */}
            <h2 className="mt-3 text-2xl font-bold text-heading">
              {t('text-order-details')}{' '}
              <span className="text-accent">{trackingLabel || 'N/A'}</span>
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-body">
              <span>{formatDetailDate(order.created_at)}</span>
              <span className="hidden text-gray-300 sm:inline">|</span>
              <span>{orderTypeLabel}</span>
            </div>
          </div>

          {/* Action buttons */}
          <ActionBar
            order={order}
            serverStatus={serverStatus}
            isUpdating={isUpdating}
            isReprinting={isReprinting}
            isDownloading={isDownloading}
            onAdvance={handleAdvanceStatus}
            onCancel={handleCancelOrder}
            onRefund={handleRefund}
            onReprint={handleReprint}
            onDownloadInvoice={handleDownloadInvoice}
          />
        </div>

        {/* Status stepper */}
        <div className="mt-5 overflow-x-auto pb-1">
          <StatusStepper
            current={serverStatus}
            delivery={delivery}
            canceled={isCanceled}
          />
        </div>

        {/* Summary stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <DetailStat
            label={t('common:text-total')}
            value={totalAmountLabel || 'N/A'}
          />
          <DetailStat
            label={t('common:text-items')}
            value={itemQuantityLabel}
          />
          <DetailStat
            label={t('common:text-payment-status')}
            value={paymentStatusLabel}
          />
          <DetailStat label={activeTimeTitle} value={activeTimeLabel} />
        </div>
      </div>

      {/* ─── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 p-6 lg:flex-row">
        {/* Left: items + summary */}
        <div className="flex w-full flex-col gap-6 lg:flex-[2]">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-4">
              <h3 className="font-semibold text-heading">
                {t('text-order-items')}
              </h3>
            </div>
            <OrderItemsTable products={order.products ?? []} />
          </div>

          <OrderSummary order={order} />
        </div>

        {/* Right: customer + order info */}
        <div className="flex w-full flex-col gap-6 lg:max-w-[360px] lg:flex-1">
          <CustomerDetails order={order} />
          <OrderInfo order={order} />

          {/* Cancellation notice */}
          {isCanceled && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <h4 className="mb-2 font-semibold text-red-700">
                Order Cancelled
              </h4>
              {(order as any)?.cancelled_reason ? (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Reason:</span>{' '}
                  {(order as any).cancelled_reason}
                </p>
              ) : null}
              {(order as any)?.cancelled_at ? (
                <p className="mt-1 text-xs text-red-500/80">
                  {formatDetailDate((order as any).cancelled_at)}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
