import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Order } from '@/types';
import {
  getOrderStatusLabelKey,
  getOrderStatusColors,
  isScheduledOrder,
  IN_PROGRESS_STATUSES,
} from '@/data/order';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';
import cn from 'classnames';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

interface OrderCardHeaderProps {
  order: Order;
}

export const OrderCardHeader = ({ order }: OrderCardHeaderProps) => {
  const { t } = useTranslation();
  const status = order.order_status ?? '';
  const scheduled = isScheduledOrder(order);
  const colors = getOrderStatusColors(status, scheduled);

  const customerName = order.customer?.name ?? order.customer_name ?? '';
  const contact = order.customer_contact ?? '';
  const address =
    order.shipping_address?.formatted_address ??
    order.billing_address?.formatted_address ??
    '';
  const statusNorm = (status ?? '').toLowerCase().replace(/\s+/g, ' ');
  const isInProgress = IN_PROGRESS_STATUSES.includes(statusNorm);
  const showReadyTime = scheduled || isInProgress;

  const readyTime = scheduled ? order.schedule_time : order.delivery_time;
  const hasReadyTime = !!readyTime;
  const timeLabel = scheduled
    ? t('common:text-scheduled-for')
    : t('text-ready-in');
  const trackingLabel = formatOrderTrackingLabel(order.tracking_number);

  return (
    <div className="relative overflow-hidden rounded-t-xl bg-white p-4 sm:p-5 text-heading border-b border-gray-100">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider',
              colors.badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
            {t(`common:${getOrderStatusLabelKey(status, scheduled)}`)}
          </span>
          {trackingLabel && (
            <span className="text-[11px] font-bold text-accent font-mono">
              {trackingLabel}
            </span>
          )}
          {order.order_type && (
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                order.order_type === 'delivery'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'bg-orange-50 text-orange-600 border border-orange-100',
              )}
            >
              {order.order_type}
            </span>
          )}
        </div>

        {showReadyTime && (
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
              {timeLabel}
            </span>
            {hasReadyTime ? (
              <>
                <span className="text-lg sm:text-xl font-bold leading-none text-accent mt-0.5">
                  {scheduled
                    ? dayjs(readyTime).format('MMM D, h:mm A')
                    : dayjs(readyTime).fromNow(true)}
                </span>
                {!scheduled && (
                  <span className="text-[11px] text-gray-500 mt-0.5 font-mono">
                    {dayjs(readyTime).format('LT')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg sm:text-xl font-bold leading-none text-gray-300 mt-0.5">
                --
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden border-t border-gray-100 pt-3">
          <h3
            className="text-base sm:text-lg font-bold leading-snug text-heading break-words line-clamp-2"
            title={customerName}
          >
            {customerName}
          </h3>
          <span
            className="font-medium font-mono text-accent text-xs sm:text-sm truncate"
            title={contact}
          >
            {contact}
          </span>
          <span
            className="text-xs text-gray-500 break-words line-clamp-2"
            title={address}
          >
            {address}
          </span>
        </div>
      </div>
    </div>
  );
};
