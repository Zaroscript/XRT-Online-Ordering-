import { useTranslation } from 'next-i18next';
import usePrice from '@/utils/use-price';
import { formatOrderDisplayValue } from '@/utils/order-display';

interface OrderSummaryProps {
  order: any;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const { t } = useTranslation('common');

  const subtotalAmount = order?.money?.subtotal ?? order?.amount ?? 0;
  const deliveryFeeAmount = order?.money?.delivery_fee ?? order?.delivery_fee ?? 0;
  const taxAmount = order?.money?.tax_total ?? order?.sales_tax ?? 0;
  const discountAmount = order?.money?.discount ?? order?.discount ?? 0;
  const tipsAmount = order?.money?.tips ?? 0;
  const totalAmount = order?.money?.total_amount ?? order?.total ?? order?.paid_total ?? 0;
  const walletAmount = order?.wallet_point?.amount ?? 0;
  const amountDueValue = Math.max(totalAmount - walletAmount, 0);
  const paymentStatusLabel = formatOrderDisplayValue(order?.payment_status);

  const { price: subtotal } = usePrice({ amount: subtotalAmount });
  const { price: shipping_charge } = usePrice({
    amount: deliveryFeeAmount,
  });
  const { price: tax } = usePrice({ amount: taxAmount });
  const { price: discount } = usePrice({ amount: discountAmount });
  const { price: tips } = usePrice({ amount: tipsAmount });
  const { price: total } = usePrice({ amount: totalAmount });
  const { price: wallet_total } = usePrice({
    amount: walletAmount,
  });
  const { price: amountDue } = usePrice({
    amount: amountDueValue,
  });

  return (
    <div className="rounded-2xl border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-heading">
        {t('text-order-summary')}
      </h3>

      <div className="mb-5 rounded-2xl border border-border-100 bg-gray-50/70 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-body">
            {t('text-payment-status')}
          </span>
          <span className="rounded-full border border-border-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-heading">
            {paymentStatusLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-3 border-b border-border-200 pb-5">
        <div className="flex items-center justify-between text-sm text-body">
          <span>{t('text-sub-total')}</span>
          <span>{subtotal}</span>
        </div>
        {deliveryFeeAmount > 0 ? (
          <div className="flex items-center justify-between text-sm text-body">
            <span>{t('text-delivery-fee')}</span>
            <span>{shipping_charge}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm text-body">
          <span>{t('text-tax')}</span>
          <span>{tax}</span>
        </div>
        {tipsAmount > 0 ? (
          <div className="flex items-center justify-between text-sm text-body">
            <span>{t('text-tips')}</span>
            <span>{tips}</span>
          </div>
        ) : null}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-body text-red-500">
            <span>{t('text-discount')}</span>
            <span>-{discount}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col space-y-3">
        <div className="flex items-center justify-between text-base font-bold text-heading">
          <span>{t('text-total')}</span>
          <span>{total}</span>
        </div>

        {walletAmount > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-body">
              <span>{t('text-paid-from-wallet')}</span>
              <span>{wallet_total}</span>
            </div>
            {amountDueValue > 0 ? (
              <div className="flex items-center justify-between text-base font-bold text-heading">
                <span>{t('text-amount-due')}</span>
                <span>{amountDue}</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
