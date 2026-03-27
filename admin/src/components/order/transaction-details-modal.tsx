import Modal from '@/components/ui/modal/modal';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import ListItemPrice from '@/components/price/list-item-price';
import { useIsRTL } from '@/utils/locals';
import cn from 'classnames';

type TransactionDetailsModalProps = {
  transaction: any;
  onClose: () => void;
};

const TransactionDetailsModal = ({
  transaction,
  onClose,
}: TransactionDetailsModalProps) => {
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();
  const order = transaction.order_id || {};
  const customer = transaction.customer_id || {};
  const isRefundTx =
    Number(transaction?.amount) < 0 || transaction?.metadata?.type === 'refund';

  return (
    <Modal open={true} onClose={onClose}>
      <div
        className={cn(
          'relative z-10 p-6 md:p-8 w-full max-w-4xl overflow-hidden rounded-xl shadow-xl',
          isRefundTx
            ? 'bg-amber-50 ring-2 ring-amber-200'
            : 'bg-white ring-1 ring-border-200'
        )}
      >
        {isRefundTx && (
          <div className="mb-4 rounded-lg border border-amber-400 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
            {tCommon('text-transaction-kind-refund')}
            {order.order_number ? ` · #${order.order_number}` : ''}
          </div>
        )}
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
              <span className="text-body">{t('table:table-item-placed-at')}:</span>
              <span className="font-medium text-heading">
                {dayjs(transaction.created_at).format('MM/DD/YYYY HH:mm')}
              </span>
              
              <span className="text-body">{t('table:table-item-completed-at')}:</span>
              <span className="font-medium text-heading">
                {order.completed_at ? dayjs(order.completed_at).format('MM/DD/YYYY HH:mm') : 'Pending'}
              </span>

              <span className="text-body">{t('table:table-item-order-type')}:</span>
              <span className="font-medium text-heading capitalize">{order.order_type}</span>

              <span className="text-body">{t('table:table-item-service-time')}:</span>
              <span className="font-medium text-heading capitalize">
                {order.service_time_type === 'Schedule' && order.schedule_time 
                  ? `${order.service_time_type} (${dayjs(order.schedule_time).format('MM/DD/YYYY HH:mm')})`
                  : (order.service_time_type || 'ASAP')}
              </span>

              <span className="text-body">{t('table:table-item-payment-gateway')}:</span>
              <span className="font-medium text-heading uppercase">{transaction.gateway}</span>

              <span className="text-body">{t('table:table-item-payment-method')}:</span>
              <span className="font-medium text-heading capitalize">
                {transaction.card_type ? `${transaction.card_type} ${transaction.last_4 ? `**** ${transaction.last_4}` : ''}` : (transaction.payment_method || transaction.gateway)}
              </span>
              
              <span className="text-body">{t('common:text-gateway-id')}:</span>
              <span className="font-medium text-heading truncate">{transaction.transaction_id}</span>
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
                {order.delivery?.address ? (
                   `${order.delivery.address.street || order.delivery.address.address1 || ''}, ${order.delivery.address.city || ''}, ${order.delivery.address.state || ''} ${order.delivery.address.zipCode || order.delivery.address.zipcode || ''}`
                ) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-heading mb-4">{t('common:order-totals')}</h3>
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>{t('table:table-item-total-items-value')}</span>
              <ListItemPrice value={order.money?.subtotal} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-tax')}</span>
              <ListItemPrice value={order.money?.tax_total} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-tip')}</span>
              <ListItemPrice value={order.money?.tips} />
            </div>
            <div className="flex justify-between">
              <span>{t('table:table-item-delivery-fee')}</span>
              <ListItemPrice value={order.money?.delivery_fee} />
            </div>
            {order.money?.coupon_code && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>{t('common:text-coupon')} ({order.money.coupon_code})</span>
                <ListItemPrice value={-(order.money.discount || 0)} />
              </div>
            )}
            {order.money?.rewards_points_used > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>{t('common:text-rewards-used')}</span>
                <span>-{order.money.rewards_points_used} pts</span>
              </div>
            )}
            <div
              className={cn(
                'flex justify-between border-t border-border-200 pt-2 font-bold text-lg',
                isRefundTx ? 'text-amber-900' : 'text-heading'
              )}
            >
              <span>{t('table:table-item-total')}</span>
              <ListItemPrice value={transaction.amount} />
            </div>
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
