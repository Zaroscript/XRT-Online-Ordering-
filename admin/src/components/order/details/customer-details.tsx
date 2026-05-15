import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/utils/format-address';
import { useFormatPhoneNumber } from '@/utils/format-phone-number';

interface CustomerDetailsProps {
  order: any;
}

const DetailField = ({
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
    <p className="mt-1 break-words text-sm font-semibold text-heading">
      {value}
    </p>
  </div>
);

const AddressBlock = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <div className="rounded-xl border border-border-100 bg-gray-50/70 px-4 py-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-body/70">
      {title}
    </p>
    <p className="mt-2 text-sm leading-6 text-heading">{value}</p>
  </div>
);

export default function CustomerDetails({ order }: CustomerDetailsProps) {
  const { t } = useTranslation('common');
  const customerName =
    order?.customer?.name || order?.customer_name || order?.delivery?.name || t('text-guest');
  const customerEmail = order?.customer?.email || 'N/A';
  const customerContact = order?.customer_contact || order?.delivery?.phone || '';
  const phoneNumber = useFormatPhoneNumber({
    customer_contact: customerContact,
  });
  const shippingAddress =
    formatAddress(order?.shipping_address) || formatAddress(order?.delivery?.address) || '';
  const billingAddress =
    formatAddress(order?.billing_address) || formatAddress(order?.customer?.address) || '';
  const primaryAddress =
    order?.order_type === 'delivery'
      ? shippingAddress || billingAddress
      : billingAddress || shippingAddress;
  const secondaryAddress =
    shippingAddress && billingAddress && shippingAddress !== billingAddress
      ? order?.order_type === 'delivery'
        ? billingAddress
        : shippingAddress
      : '';

  return (
    <div className="rounded-2xl border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-heading">
        {t('text-customer-details')}
      </h3>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <DetailField label={t('text-name')} value={customerName || 'N/A'} />
        <DetailField label={t('text-contact')} value={phoneNumber || 'N/A'} />
        <DetailField label={t('text-email')} value={customerEmail} />
      </div>

      {primaryAddress ? (
        <div className="mt-5 space-y-3">
          <AddressBlock
            title={
              order?.order_type === 'delivery'
                ? t('text-delivery-address')
                : t('text-billing-address')
            }
            value={primaryAddress}
          />

          {secondaryAddress ? (
            <AddressBlock
              title={
                order?.order_type === 'delivery'
                  ? t('text-billing-address')
                  : t('text-shipping-address')
              }
              value={secondaryAddress}
            />
          ) : null}
        </div>
      ) : (
        <div className="mt-5">
          <AddressBlock
            title={
              order?.order_type === 'delivery'
                ? t('text-delivery-address')
                : t('text-billing-address')
            }
            value={
              order?.order_type === 'pickup'
                ? 'Pickup / No delivery address required'
                : 'N/A'
            }
          />
        </div>
      )}
    </div>
  );
}
