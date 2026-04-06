import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  newOrderAtom,
  newOrderModalStateAtom,
  pendingOrdersAtom,
} from '@/store/order-atoms';
import Modal from '@/components/ui/modal/modal';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import cn from 'classnames';
import { DatePicker } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';
import { toast } from 'react-toastify';
import { useUpdateOrderMutation } from '@/data/order';

export default function NewOrderModal() {
  const { t } = useTranslation();
  const [modalState, setModalState] = useAtom(newOrderModalStateAtom);
  const [, setNewOrder] = useAtom(newOrderAtom);
  const [, setPendingOrders] = useAtom(pendingOrdersAtom);
  const { isOpen, order: newOrder } = modalState;

  const [selectedTimeOption, setSelectedTimeOption] = useState<
    number | 'custom' | null
  >(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const { mutate: updateOrder, isPending: updating } = useUpdateOrderMutation();

  const handleClose = () => {
    // Remove the current order from the queue and close modal
    if (newOrder) {
      setPendingOrders((prev) => prev.filter((o) => o.id !== newOrder.id));
    }
    setModalState({ isOpen: false, order: null });
  };

  const handleAcceptOrder = () => {
    if (!newOrder) return;

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
      toast.error(
        t('text-select-time-error') ?? 'Please select a preparation time',
      );
      return;
    }

    const readyAt = dayjs().add(preparationTime, 'minute').toISOString();
    updateOrder(
      {
        id: newOrder.id,
        status: 'accepted',
        ready_time: readyAt,
        silent: true,
      },
      {
        onSuccess: () => {
          toast.success(
            t('text-order-accepted-message', { time: preparationTime }),
          );
          // Remove from pending queue and close modal (next one will auto-open)
          setPendingOrders((prev) => prev.filter((o) => o.id !== newOrder.id));
          setModalState({ isOpen: false, order: null });
          setNewOrder(null);
        },
      },
    );
  };

  if (!newOrder) return null;

  // ── Data extraction from admin Order type (mapped by serverOrderToAdminOrder) ──
  const customerName =
    (newOrder as any)?.customer_name ||
    (newOrder as any)?.customer?.name ||
    (newOrder as any)?.delivery?.name ||
    '';
  const contact =
    (newOrder as any)?.customer_contact ||
    (newOrder as any)?.delivery?.phone ||
    '';
  const address =
    (newOrder as any)?.shipping_address?.formatted_address ??
    (newOrder as any)?.billing_address?.formatted_address ??
    (newOrder as any)?.delivery?.address?.formatted_address ??
    'N/A';

  const subtotal =
    (newOrder as any)?.amount ?? (newOrder as any)?.money?.subtotal ?? 0;
  const tax =
    (newOrder as any)?.sales_tax ?? (newOrder as any)?.money?.tax_total ?? 0;
  const deliveryFee =
    (newOrder as any)?.delivery_fee ??
    (newOrder as any)?.money?.delivery_fee ??
    0;
  const discount =
    (newOrder as any)?.discount ?? (newOrder as any)?.money?.discount ?? 0;
  const tips = (newOrder as any)?.money?.tips ?? 0;
  const totalAmount =
    (newOrder as any)?.total ?? (newOrder as any)?.money?.total_amount ?? 0;
  const currency = (newOrder as any)?.money?.currency ?? 'USD';
  const paymentMethod =
    (newOrder as any)?.payment_status ??
    (newOrder as any)?.money?.payment ??
    'cash';
  const paymentStatus = (newOrder as any)?.payment_status ?? 'pending';
  const orderType = (newOrder as any)?.order_type ?? 'pickup';
  const items = (newOrder as any)?.products ?? [];

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="flex flex-col w-[95vw] max-w-5xl bg-gray-50 rounded-lg overflow-hidden h-[90vh] md:h-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-heading flex items-center gap-3">
              {t('text-new-order')}{' '}
              <span className="text-accent">
                #{(newOrder as any).tracking_number || newOrder.id}
              </span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            </h2>
            <span className="text-sm text-body-dark">
              {dayjs((newOrder as any).created_at).format(
                'MMMM D, YYYY h:mm A',
              )}
            </span>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-sm font-semibold capitalize bg-accent/10 text-accent border border-accent/20">
              {paymentMethod}
            </div>
            {paymentStatus !== paymentMethod && (
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-semibold capitalize border',
                  paymentStatus === 'paid'
                    ? 'bg-accent text-white hover:bg-accent-hover'
                    : 'bg-yellow-100 text-yellow-600 border-yellow-200',
                )}
              >
                {paymentStatus}
              </div>
            )}
          </div>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column: Items & Summary */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              {/* Order Items - Rich Detail Cards */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-heading">
                    {t('text-order-items')}
                  </h3>
                  <span className="text-xs text-muted bg-gray-100 px-2 py-1 rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item: any, idx: number) => {
                    const qty =
                      item.pivot?.order_quantity ?? item.quantity ?? 1;
                    const unitPrice =
                      item.pivot?.unit_price ?? item.unit_price ?? 0;
                    const lineSubtotal =
                      item.pivot?.subtotal ?? unitPrice * qty;
                    const size = item.pivot?.variation ?? item.size_snap;
                    const modifiers = item.pivot?.modifiers ?? [];

                    return (
                      <div key={idx} className="p-4">
                        {/* Item Header */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-heading text-sm">
                                {item.name ?? item.name_snap}
                              </span>
                              {size && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                                  {size}
                                </span>
                              )}
                            </div>

                            {/* Modifiers */}
                            {modifiers.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {modifiers.map((mod: any, mIdx: number) => (
                                  <div
                                    key={mIdx}
                                    className="flex items-center justify-between text-xs text-gray-500 pl-3 border-l-2 border-accent/20"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-1 h-1 bg-accent/40 rounded-full" />
                                      {mod.modifier_name_snap ??
                                        mod.name_snapshot ??
                                        'Modifier'}
                                      {mod.quantity_label_snapshot && (
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                                          {mod.quantity_label_snapshot}
                                        </span>
                                      )}
                                      {mod.selected_side && (
                                        <span
                                          className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase',
                                            mod.selected_side === 'LEFT'
                                              ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                              : mod.selected_side === 'RIGHT'
                                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                                : 'bg-green-50 text-green-600 border border-green-200',
                                          )}
                                        >
                                          {mod.selected_side}
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-xs font-medium text-gray-600">
                                      {(mod.unit_price_delta ?? 0) !== 0
                                        ? `+${Number(mod.unit_price_delta).toFixed(2)}`
                                        : 'incl.'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-semibold">
                              x{qty}
                            </span>
                            <span className="text-sm font-bold text-heading min-w-[70px] text-right">
                              {Number(lineSubtotal).toFixed(2)} {currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary - Full Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-heading mb-4">
                  {t('text-order-summary')}
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-body">{t('text-sub-total')}</span>
                    <span className="font-semibold text-heading">
                      {Number(subtotal).toFixed(2)} {currency}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body">
                        {t('text-tax') || 'Tax'}
                      </span>
                      <span className="font-semibold text-heading">
                        {Number(tax).toFixed(2)} {currency}
                      </span>
                    </div>
                  )}

                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body">
                        {t('text-delivery-fee') || 'Delivery Fee'}
                      </span>
                      <span className="font-semibold text-heading">
                        {Number(deliveryFee).toFixed(2)} {currency}
                      </span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body">
                        {t('text-discount') || 'Discount'}
                      </span>
                      <span className="font-semibold text-green-600">
                        -{Number(discount).toFixed(2)} {currency}
                      </span>
                    </div>
                  )}

                  {tips > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body">
                        {t('text-tips') || 'Tips'}
                      </span>
                      <span className="font-semibold text-heading">
                        {Number(tips).toFixed(2)} {currency}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-heading">
                      {t('text-total')}
                    </span>
                    <span className="text-xl font-bold text-accent">
                      {Number(totalAmount).toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Customer & Order Info */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              {/* Order Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-heading mb-4">
                  {t('text-order-details') || 'Order Details'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted uppercase">
                      Order Type
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-full capitalize',
                        orderType === 'delivery'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-orange-50 text-orange-600 border border-orange-100',
                      )}
                    >
                      {orderType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted uppercase">
                      Payment
                    </span>
                    <span className="text-sm font-medium text-heading capitalize">
                      {paymentMethod}
                    </span>
                  </div>
                  {(newOrder as any)?.schedule_time && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted uppercase">
                        {t('text-schedule') || 'Scheduled'}
                      </span>
                      <span className="text-sm font-medium text-heading">
                        {dayjs((newOrder as any).schedule_time).format(
                          'h:mm A',
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-heading mb-4">
                  {t('text-customer-details')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted uppercase mb-1">
                      {t('text-name')}
                    </div>
                    <div className="font-medium text-heading">
                      {customerName || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase mb-1">
                      {t('text-contact')}
                    </div>
                    <div className="font-medium text-heading">
                      {contact || '—'}
                    </div>
                  </div>
                  {orderType === 'delivery' && (
                    <div>
                      <div className="text-xs text-muted uppercase mb-1">
                        {t('text-delivery-address')}
                      </div>
                      <div className="font-medium text-heading text-sm">
                        {address}
                      </div>
                    </div>
                  )}
                  {(newOrder as any)?.note && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
                      <span className="font-bold block text-xs uppercase mb-1">
                        {t('text-note')}:
                      </span>
                      {(newOrder as any).note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-bold text-heading mb-2 uppercase tracking-wide">
                  {t('text-select-preparation-time')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeOption(time)}
                      className={cn(
                        'rounded-md border px-4 py-2 text-sm font-bold transition-all focus:outline-none shadow-sm',
                        selectedTimeOption === time
                          ? 'border-accent bg-accent text-white shadow-accent/30'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent',
                      )}
                    >
                      {time} min
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTimeOption('custom')}
                    className={cn(
                      'rounded-md border px-4 py-2 text-sm font-bold transition-all focus:outline-none shadow-sm',
                      selectedTimeOption === 'custom'
                        ? 'border-accent bg-accent text-white shadow-accent/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent',
                    )}
                  >
                    {t('text-custom') ?? 'Custom'}
                  </button>
                </div>
                {selectedTimeOption === 'custom' && (
                  <div className="mt-3 animate-fadeIn max-w-[200px]">
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
                      placement="topStart"
                      size="md"
                      locale={{ ok: 'Done' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto self-end">
                <Button
                  onClick={handleAcceptOrder}
                  loading={updating}
                  disabled={updating || !selectedTimeOption}
                  className="flex-1 md:flex-none h-12 px-8 bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/30 text-base"
                >
                  {t('text-accept-order')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
