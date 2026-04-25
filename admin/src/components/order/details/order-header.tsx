import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import { DownloadIcon } from '@/components/icons/download-icon';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import { useModalAction } from '@/components/ui/modal/modal.context';
import {
  getOrderStatusColors,
  getOrderStatusLabelKey,
  isScheduledOrder,
} from '@/data/order';
import { formatOrderDisplayValue } from '@/utils/order-display';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';

interface OrderHeaderProps {
  order: any;
  onDownloadInvoice: () => void;
  loading?: boolean;
}

export default function OrderHeader({
  order,
  onDownloadInvoice,
  loading,
}: OrderHeaderProps) {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const trackingLabel = formatOrderTrackingLabel(order?.tracking_number);
  const scheduled = isScheduledOrder(order);
  const statusColors = getOrderStatusColors(order?.order_status, scheduled);
  const paymentStatus = String(order?.payment_status ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  const paymentLabelMap: Record<string, string> = {
    pending: t('payment-pending'),
    payment_pending: t('payment-pending'),
    processing: t('payment-processing'),
    payment_processing: t('payment-processing'),
    paid: t('payment-success'),
    success: t('payment-success'),
    payment_success: t('payment-success'),
    refunded: t('payment-refunded'),
    payment_refunded: t('payment-refunded'),
  };
  const paymentLabel =
    paymentLabelMap[paymentStatus] ||
    (paymentStatus === 'partially_refunded'
      ? 'Partially Refunded'
      : formatOrderDisplayValue(order?.payment_status));
  const refundButtonLabel = paymentStatus === 'pending' ? 'Void Payment' : 'Refund Order';

  const handleRefund = () => {
    const preferredAction = paymentStatus === 'pending' ? 'void' : 'refund';
    openModal('REFUND_ORDER', {
      orderId: order?.id,
      totalAmount: order?.total,
      trackingNumber: order?.tracking_number,
      preferredAction,
    });
  };

  return (
    <div className="flex flex-col rounded-lg border border-border-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="mb-4 sm:mb-0">
        <h2 className="mb-2 text-xl font-bold text-heading">
          {t('form:input-label-order-id')}{' '}
          <span className="text-base font-normal text-body">
            {trackingLabel || 'N/A'}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            text={t(`common:${getOrderStatusLabelKey(order?.order_status, scheduled)}`)}
            color={statusColors.badge}
            className="flex min-h-[2rem] items-center text-sm font-medium"
          />
          <Badge
            text={paymentLabel}
            color={StatusColor(order?.payment_status)}
            className="flex min-h-[2rem] items-center text-sm font-medium"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {((order?.payment_status === 'paid' ||
          order?.payment_status === 'partially_refunded' ||
          order?.payment_status === 'pending' ||
          order?.money?.payment_status === 'paid' ||
          order?.money?.payment_status === 'partially_refunded' ||
          order?.money?.payment_status === 'pending') &&
          order?.payment_status !== 'refunded' &&
          order?.money?.payment_status !== 'refunded') && (
          <Button
            onClick={handleRefund}
            variant="outline"
            className="!text-red-500 hover:!bg-red-50 border-red-500 hover:border-red-500 w-full sm:w-auto"
          >
            {refundButtonLabel}
          </Button>
        )}
        <Button
          onClick={onDownloadInvoice}
          loading={loading}
          className="w-full sm:w-auto"
        >
          <DownloadIcon className="h-4 w-4 me-3" />
          {t('text-download')} {t('text-invoice')}
        </Button>
      </div>
    </div>
  );
}
