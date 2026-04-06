import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Order, OrderStatus } from '@/types';
import usePrice from '@/utils/use-price';
import { useUpdateOrderMutation, getOrderStatusLabelKey, getOrderStatusColors, isScheduledOrder } from '@/data/order';
import { useModalAction } from '@/components/ui/modal/modal.context';
import cn from 'classnames';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { CheckMark } from '@/components/icons/checkmark';
import { toast } from 'react-toastify';
import { DatePicker } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';
import dayjs from 'dayjs';

interface OrderCardFooterProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export const OrderCardFooter = ({
  order,
  onViewDetails,
}: OrderCardFooterProps) => {
  const { t } = useTranslation();
  const { mutate: updateOrder, mutateAsync: updateOrderAsync, isPending: isLoading } =
    useUpdateOrderMutation();
  const { openModal } = useModalAction();

  const [selectedTimeOption, setSelectedTimeOption] = useState<number | 'custom' | null>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const status = order.order_status;
  const isDelivery = order.order_type === 'delivery';
  const orderAmount = order.amount;
  const orderTax = order.sales_tax;
  const orderTotal = order.total;

  const { price: sub_total } = usePrice({
    amount: orderAmount,
    currencyCode: 'USD',
  });

  const { price: sales_tax_display } = usePrice({
    amount: orderTax,
    currencyCode: 'USD',
  });

  const { price: total } = usePrice({
    amount: orderTotal,
    currencyCode: 'USD',
  });

  const handlePickup = () => {
    updateOrder({
      id: order.id,
      status: OrderStatus.COMPLETED,
    });
  };

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
        toast.error(t('text-invalid-custom-time') ?? 'Please enter a valid time');
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

  const isPending = status === 'order-pending' || status === OrderStatus.PENDING || status === 'pending';
  const isScheduled = isScheduledOrder(order);

  const handleStartOrder = () => {
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
        toast.error(t('text-invalid-custom-time') ?? 'Please enter a valid time');
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
      status: 'accepted',
      ready_time: readyAt,
      clear_schedule: true,
    });
  };

  const renderAction = () => {
    if (isScheduled) {
      return (
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {dayjs(order.schedule_time).format('MMM D, h:mm A')}
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t('common:text-ready-time')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedTimeOption(option.value);
                  setCustomDate(null);
                }}
                className={cn(
                  'px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors',
                  selectedTimeOption === option.value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                )}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedTimeOption('custom')}
              className={cn(
                'px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors',
                selectedTimeOption === 'custom'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
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
                placement="auto"
                style={{ width: '100%' }}
                size="sm"
                locale={{ ok: 'Done' }}
              />
            </div>
          )}

          <button
            onClick={handleStartOrder}
            disabled={isLoading || !selectedTimeOption || (selectedTimeOption === 'custom' && !customDate)}
            className={cn(
              'group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-accent py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              (isLoading || !selectedTimeOption || (selectedTimeOption === 'custom' && !customDate))
                && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="relative z-10 uppercase tracking-widest text-xs">
              {isLoading ? t('text-processing') : t('common:text-start-order')}
            </span>
          </button>
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="flex flex-col gap-2.5 w-full">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t('common:text-ready-time')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedTimeOption(option.value);
                  setCustomDate(null);
                }}
                className={cn(
                  'px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors',
                  selectedTimeOption === option.value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
                )}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedTimeOption('custom')}
              className={cn(
                'px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors',
                selectedTimeOption === 'custom'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent',
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
                placement="auto"
                style={{ width: '100%' }}
                size="sm"
                locale={{ ok: 'Done' }}
              />
            </div>
          )}

          <button
            onClick={handleAcceptOrder}
            disabled={isLoading || !selectedTimeOption || (selectedTimeOption === 'custom' && !customDate)}
            className={cn(
              'group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-accent py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              (isLoading || !selectedTimeOption || (selectedTimeOption === 'custom' && !customDate))
                && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="relative z-10 uppercase tracking-widest text-xs">
              {isLoading ? t('text-processing') : t('text-accept-order')}
            </span>
          </button>
        </div>
      );
    }

    switch (status) {
      case 'order-processing':
      case 'order-at-local-facility':
      case 'order-out-for-delivery':
      case 'in_kitchen':
      case 'ready':
      case 'inkitchen':
      case 'accepted':
      case 'out of delivery':
      case OrderStatus.PROCESSING:
      case OrderStatus.AT_LOCAL_FACILITY:
      case OrderStatus.OUT_FOR_DELIVERY:
        return (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handlePickup}
              disabled={isLoading}
              className={cn(
                'group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-accent py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                isLoading && 'cursor-not-allowed opacity-70',
              )}
            >
              <div className="absolute inset-0 translate-y-full skew-y-12 bg-white/20 transition-transform duration-500 group-hover:translate-y-[-150%]"></div>
              <span className="relative z-10 uppercase tracking-widest text-xs">
                {isLoading
                  ? t('text-processing')
                  : isDelivery
                    ? t('common:text-ready-for-delivery')
                    : t('text-ready-for-pickup')}
              </span>
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
                'flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 uppercase tracking-widest transition-colors hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            >
              {t('common:text-cancel-order')}
            </button>
          </div>
        );

      case 'order-completed':
      case 'completed':
      case OrderStatus.COMPLETED: {
        const completedColors = getOrderStatusColors('completed');
        return (
          <div className={cn('flex w-full items-center justify-center rounded-lg border py-3.5 text-sm font-bold', completedColors.badge)}>
            <span className="uppercase tracking-widest flex items-center gap-2">
              <CheckMark width={16} height={16} />
              {t(`common:${getOrderStatusLabelKey('completed')}`)}
            </span>
          </div>
        );
      }

      case 'order-cancelled':
      case 'order-failed':
      case 'canceled':
      case 'cancelled':
      case OrderStatus.CANCELLED:
      case OrderStatus.FAILED: {
        const canceledColors = getOrderStatusColors('canceled');
        const cancelReason = order.cancelled_reason;
        return (
          <div className="flex w-full flex-col gap-2">
            {cancelReason && (
              <p className="text-xs text-gray-600 text-center px-2 line-clamp-2" title={cancelReason}>
                {cancelReason}
              </p>
            )}
            <div className={cn('flex w-full items-center justify-center rounded-lg border py-3.5 text-sm font-bold', canceledColors.badge)}>
              <span className="uppercase tracking-widest">
                {t(`common:${getOrderStatusLabelKey('canceled')}`)}
              </span>
            </div>
          </div>
        );
      }

      default:
        if (onViewDetails) {
          return (
            <button
              onClick={() => onViewDetails(order)}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              <span className="relative z-10 uppercase tracking-widest">
                {t('text-view-details')}
              </span>
            </button>
          );
        }
        return (
          <Link
            href={`${Routes.order.list}/${order.id}`}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            <span className="relative z-10 uppercase tracking-widest">
              {t('text-view-details')}
            </span>
          </Link>
        );
    }
  };

  return (
    <div className="mt-auto border-t border-gray-100 bg-gray-50 rounded-b-xl p-5 space-y-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-body">
          <span>{t('text-sub-total')}</span>
          <span className="font-mono">{sub_total}</span>
        </div>
        <div className="flex justify-between text-body">
          <span>{t('text-tax')}</span>
          <span className="font-mono">{sales_tax_display}</span>
        </div>
        <div className="flex justify-between font-bold text-heading text-base pt-3 border-t border-gray-200 mt-1">
          <span className="uppercase tracking-wider text-xs flex items-center">
            {t('text-total')}
          </span>
          <span className="text-xl text-accent">{total}</span>
        </div>
      </div>

      {renderAction()}
    </div>
  );
};
