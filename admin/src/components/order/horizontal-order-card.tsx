import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Order, OrderStatus } from '@/types';
import usePrice from '@/utils/use-price';
import Button from '@/components/ui/button';
import { useUpdateOrderMutation, getOrderStatusLabelKey, getOrderStatusColors, isScheduledOrder } from '@/data/order';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { toast } from 'react-toastify';
import cn from 'classnames';
import { DatePicker } from 'rsuite';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';
import 'rsuite/dist/rsuite-no-reset.min.css';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

interface HorizontalOrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export default function HorizontalOrderCard({
  order,
  onViewDetails,
}: HorizontalOrderCardProps) {
  const { t } = useTranslation();
  const [selectedTimeOption, setSelectedTimeOption] = useState<
    number | 'custom' | null
  >(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const { mutate: updateOrder, mutateAsync: updateOrderAsync, isPending: isLoading } =
    useUpdateOrderMutation();
  const { openModal } = useModalAction();

  const customerName = order.customer?.name ?? order.customer_name ?? '';
  const contact = order.customer_contact ?? '';
  const address =
    order.shipping_address?.formatted_address ??
    order.billing_address?.formatted_address ??
    '';
  const trackingLabel = formatOrderTrackingLabel(order.tracking_number) || 'N/A';
  const status = order.order_status;
  const orderTotal = order.total;

  const { price: totalPrice } = usePrice({
    amount: orderTotal,
    currencyCode: 'USD',
  });

  const products = order.products ?? [];
  const itemCount = products?.length ?? 0;

  // --- Actions ---

  const timeOptions = [
    { label: t('text-15-min'), value: 15 },
    { label: t('text-30-min'), value: 30 },
    { label: t('text-45-min'), value: 45 },
    { label: t('text-1-hr'), value: 60 },
  ];

  const handleAcceptOrder = () => {
    let preparationTime: number;

    if (selectedTimeOption === 'custom') {
      if (!customDate) {
        toast.error(t('text-invalid-custom-time') ?? 'Please select a time');
        return;
      }
      const hours = dayjs(customDate).hour();
      const minutes = dayjs(customDate).minute();
      preparationTime = hours * 60 + minutes;

      if (preparationTime <= 0) {
        toast.error(
          t('text-invalid-custom-time') ?? 'Please enter a valid time',
        );
        return;
      }
    } else if (selectedTimeOption) {
      preparationTime = selectedTimeOption;
    } else {
      toast.error(t('text-select-time-error'));
      return;
    }

    const readyAt = dayjs().add(preparationTime, 'minute').toISOString();

    updateOrder({
      id: order.id,
      status: OrderStatus.PROCESSING,
      ready_time: readyAt,
    });
  };

  // --- Render Logic ---

  const isNewOrder = status === 'order-pending' || status === 'pending';
  const isScheduled = isScheduledOrder(order);
  const isCompleted = status === 'order-completed' || status === 'completed';
  const isCanceled = ['canceled', 'cancelled'].includes(status.toLowerCase());
  const isInProgress = !isNewOrder && !isScheduled && !isCompleted && !isCanceled;
  const statusLabelKey = getOrderStatusLabelKey(status, isScheduled);
  const statusColors = getOrderStatusColors(status, isScheduled);

  return (
    <div className="flex flex-col md:flex-row w-full items-center justify-between rounded-xl bg-white p-5 shadow-card border border-border-200 hover:border-accent/30 transition-all gap-4">
      {/* Basic Info */}
      <div className="flex flex-col gap-1.5 w-full md:w-1/3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">{trackingLabel}</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">
            {dayjs((order as any).created_at).format('MMM D, h:mm A')}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              statusColors.badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusColors.dot)} />
            {t(`common:${statusLabelKey}`)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-heading truncate">
          {customerName}
        </h3>
        <p className="text-xs text-gray-500 truncate">{contact}</p>
        <p className="text-xs text-gray-500 truncate">{address}</p>
      </div>

      {/* Order Summary */}
      <div className="flex flex-col gap-1 w-full md:w-1/4 border-l pl-4 border-gray-100">
        <span className="text-xs text-gray-400 uppercase tracking-widest">
          {t('text-total')}
        </span>
        <span className="text-xl font-bold text-accent">{totalPrice}</span>
        <span className="text-xs text-gray-500">
          {itemCount} {itemCount === 1 ? t('text-item') : t('text-items')}
        </span>
      </div>

      {/* Actions / Status Specific */}
      <div className="flex flex-col gap-3 w-full md:w-1/3 items-end">
        {isNewOrder && (
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            <div className="flex flex-wrap gap-2 justify-end">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedTimeOption(option.value);
                    setCustomDate(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors',
                    selectedTimeOption === option.value
                      ? 'bg-accent text-white border-accent'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                  )}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedTimeOption('custom')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors',
                  selectedTimeOption === 'custom'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                )}
              >
                {t('text-custom')}
              </button>
            </div>

            {selectedTimeOption === 'custom' && (
              <div className="w-full relative z-50">
                <style jsx global>{`
                  .rs-picker-toggle {
                    border-radius: 0.375rem !important; /* rounded-md */
                    border-color: #e5e7eb !important; /* border-gray-200 */
                    padding-top: 0.5rem !important;
                    padding-bottom: 0.5rem !important;
                    box-shadow: none !important;
                    font-size: 0.875rem !important; /* text-sm */
                  }
                  .rs-picker-toggle:hover {
                    border-color: #009f7f !important; /* accent color */
                  }
                  .rs-picker-toggle.rs-btn-active {
                    border-color: #009f7f !important;
                    box-shadow: 0 0 0 3px rgba(0, 159, 127, 0.2) !important;
                  }
                  /* Popup Styles */
                  .rs-picker-menu {
                    border-radius: 0.5rem !important;
                    box-shadow:
                      0 10px 15px -3px rgba(0, 0, 0, 0.1),
                      0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    border: 1px solid #e5e7eb !important;
                    z-index: 1000 !important;
                  }
                  .rs-calendar-header-title {
                    font-weight: 600 !important;
                    color: #1f2937 !important;
                  }
                  .rs-calendar-time-dropdown-content {
                    background-color: #fff !important;
                  }
                  .rs-calendar-time-dropdown-cell-active {
                    background-color: #009f7f !important;
                    color: #fff !important;
                  }
                  .rs-btn-primary {
                    background-color: #009f7f !important;
                    border-color: #009f7f !important;
                  }
                  .rs-btn-primary:hover,
                  .rs-btn-primary:focus,
                  .rs-btn-primary:active,
                  .rs-btn-primary.rs-btn-active {
                    background-color: #008f72 !important;
                    border-color: #008f72 !important;
                  }
                  /* Target specific OK button in toolbar if needed */
                  .rs-picker-toolbar-right-btn-ok {
                    background-color: #009f7f !important;
                    color: #fff !important;
                  }
                `}</style>
                <DatePicker
                  format="HH:mm"
                  showMeridian={false}
                  ranges={[]}
                  placeholder={t('text-select-time') ?? 'Select Time'}
                  value={customDate}
                  onChange={(date: Date | null) => {
                    setCustomDate(date);
                  }}
                  className="w-full"
                  cleanable={false}
                  placement="bottomEnd"
                  style={{ width: '100%' }}
                  size="lg"
                  locale={{
                    ok: 'Done',
                  }}
                />
              </div>
            )}

            <Button
              onClick={handleAcceptOrder}
              loading={isLoading}
              disabled={
                isLoading ||
                !selectedTimeOption ||
                (selectedTimeOption === 'custom' && !customDate)
              }
              className="w-full"
            >
              {t('text-accept-order')}
            </Button>
          </div>
        )}

        {isScheduled && order.schedule_time && (
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-heading">
                {dayjs(order.schedule_time).format('MMM D, h:mm A')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedTimeOption(option.value);
                    setCustomDate(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors',
                    selectedTimeOption === option.value
                      ? 'bg-accent text-white border-accent'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                  )}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedTimeOption('custom')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors',
                  selectedTimeOption === 'custom'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                )}
              >
                {t('text-custom')}
              </button>
            </div>

            {selectedTimeOption === 'custom' && (
              <div className="w-full relative z-50">
                <DatePicker
                  format="HH:mm"
                  showMeridian={false}
                  ranges={[]}
                  placeholder={t('text-select-time') ?? 'Select Time'}
                  value={customDate}
                  onChange={(date: Date | null) => setCustomDate(date)}
                  className="w-full"
                  cleanable={false}
                  placement="bottomEnd"
                  style={{ width: '100%' }}
                  size="lg"
                  locale={{ ok: 'Done' }}
                />
              </div>
            )}

            <Button
              onClick={() => {
                let prepTime: number;
                if (selectedTimeOption === 'custom') {
                  if (!customDate) { toast.error(t('text-invalid-custom-time')); return; }
                  prepTime = dayjs(customDate).hour() * 60 + dayjs(customDate).minute();
                  if (prepTime <= 0) { toast.error(t('text-invalid-custom-time')); return; }
                } else if (selectedTimeOption) {
                  prepTime = selectedTimeOption;
                } else {
                  toast.error(t('text-select-time-error')); return;
                }
                const readyAt = dayjs().add(prepTime, 'minute').toISOString();
                updateOrder({ id: order.id, status: 'accepted', ready_time: readyAt, clear_schedule: true });
              }}
              loading={isLoading}
              disabled={isLoading || !selectedTimeOption || (selectedTimeOption === 'custom' && !customDate)}
              className="w-full"
            >
              {t('common:text-start-order')}
            </Button>
          </div>
        )}

        {isInProgress && (
          <div className="flex flex-col gap-2 w-full items-end">
            <button
              onClick={() => updateOrder({ id: order.id, status: OrderStatus.COMPLETED })}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-white uppercase tracking-wider transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            >
              {isLoading ? t('text-processing') : order.order_type === 'delivery' ? t('common:text-ready-for-delivery') : t('text-ready-for-pickup')}
            </button>
            <button
              type="button"
              onClick={() => openModal('CONFIRM_ACTION', {
                title: t('common:text-cancel-order'),
                description: t('common:text-cancel-order-confirm'),
                deleteBtnText: t('common:text-cancel-order'),
                cancelBtnText: t('common:text-back'),
                requireReason: true,
                reasonLabel: 'text-cancel-reason',
                reasonPlaceholder: 'text-cancel-reason-placeholder',
                onConfirm: (reason: string) => updateOrderAsync({
                  id: String(order.id),
                  status: 'canceled',
                  cancelled_reason: reason,
                }),
              })}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 uppercase tracking-wider transition-colors hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            >
              {t('common:text-cancel-order')}
            </button>
          </div>
        )}

        {isCanceled && order.cancelled_reason && (
          <p className="text-xs text-gray-600 text-right line-clamp-2" title={order.cancelled_reason}>
            {order.cancelled_reason}
          </p>
        )}

        <button
          onClick={() => onViewDetails?.(order)}
          className="text-sm font-bold text-accent hover:text-accent-hover transition-colors underline decoration-dotted underline-offset-4"
        >
          {t('text-view-details')}
        </button>
      </div>
    </div>
  );
}
