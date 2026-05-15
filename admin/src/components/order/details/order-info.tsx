import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { formatOrderDisplayValue } from '@/utils/order-display';

interface OrderInfoProps {
  order: any;
}

function getOrderQuantity(order: any) {
  return (order?.products ?? []).reduce(
    (total: number, product: any) =>
      total + Number(product?.pivot?.order_quantity ?? product?.quantity ?? 0),
    0,
  );
}

function formatDetailDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format('MMM D, YYYY h:mm A') : 'N/A';
}

function getPaymentMethod(order: any) {
  const cardBrand = order?.money?.card_type || order?.card_type;
  const cardLast4 = order?.money?.last_4 || order?.last_4;

  if (cardBrand) {
    return `${formatOrderDisplayValue(cardBrand)}${
      cardLast4 ? ` **** ${cardLast4}` : ''
    }`;
  }

  return formatOrderDisplayValue(
    order?.payment_gateway || order?.money?.payment || order?.payment_status,
  );
}

const OrderInfoField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-border-100 bg-gray-50/70 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-body/70">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-heading">{value}</p>
  </div>
);

export default function OrderInfo({ order }: OrderInfoProps) {
  const { t } = useTranslation(['common', 'form']);
  const productLines = order?.products?.length ?? 0;
  const totalQuantity = getOrderQuantity(order);
  const normalizedStatus = String(order?.order_status ?? '').toLowerCase();
  const paymentMethod = getPaymentMethod(order);
  const paymentStatus = formatOrderDisplayValue(order?.payment_status);
  const orderType =
    order?.order_type === 'delivery'
      ? t('form:text-delivery')
      : order?.order_type === 'pickup'
        ? t('form:text-pickup')
        : formatOrderDisplayValue(order?.order_type);
  const serviceTimeType = formatOrderDisplayValue(
    (order as any)?.service_time_type,
  );
  const readyTime = formatDetailDate(
    (order as any)?.actual_ready_time ||
      (order as any)?.ready_time ||
      order?.delivery_time,
  );
  const scheduledFor = formatDetailDate(order?.schedule_time);
  const completedAt = formatDetailDate((order as any)?.completed_at);
  const cancelledAt = formatDetailDate((order as any)?.cancelled_at);
  const isCompleted = normalizedStatus === 'completed';
  const isCancelled =
    normalizedStatus === 'canceled' || normalizedStatus === 'cancelled';

  return (
    <div className="rounded-2xl border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-heading">
        {t('text-order-info')}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <OrderInfoField label={t('text-payment-method')} value={paymentMethod} />
        <OrderInfoField label={t('text-payment-status')} value={paymentStatus} />
        <OrderInfoField
          label={t('text-order-date')}
          value={formatDetailDate(order?.created_at)}
        />
        <OrderInfoField label="Order Type" value={orderType} />
        <OrderInfoField
          label={t('text-total-items')}
          value={`${totalQuantity} ${
            totalQuantity === 1 ? t('text-item') : t('text-items')
          } | ${productLines} line${productLines === 1 ? '' : 's'}`}
        />
        <OrderInfoField
          label={t('text-delivery-schedule')}
          value={scheduledFor !== 'N/A' ? scheduledFor : serviceTimeType}
        />
        <OrderInfoField label={t('text-ready-time')} value={readyTime} />
        {isCompleted && completedAt !== 'N/A' ? (
          <OrderInfoField
            label={t('text-order-status-completed')}
            value={completedAt}
          />
        ) : null}
        {isCancelled ? (
          <OrderInfoField
            label={t('text-canceled')}
            value={
              order?.cancelled_reason
                ? `${cancelledAt !== 'N/A' ? `${cancelledAt} - ` : ''}${order.cancelled_reason}`
                : cancelledAt
            }
          />
        ) : null}
      </div>

      {order?.note ? (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-heading">
            {t('text-purchase-note')}
          </h4>
          <div className="rounded-xl border border-border-100 bg-gray-50/80 p-4 text-sm text-body">
            {order.note}
          </div>
        </div>
      ) : null}
    </div>
  );
}
