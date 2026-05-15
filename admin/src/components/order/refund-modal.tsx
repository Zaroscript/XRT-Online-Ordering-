import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalState, useModalAction } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRefundOrderMutation } from '@/data/order';
import { formatOrderTrackingLabel } from '@/utils/order-tracking';
import { orderClient } from '@/data/client/order';

const RefundModal = () => {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: refundOrder, isPending } = useRefundOrderMutation();

  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [actionType, setActionType] = useState<'refund' | 'void'>('refund');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [remainingRefundable, setRemainingRefundable] = useState<number | null>(null);

  const displayId =
    formatOrderTrackingLabel(data?.trackingNumber, data?.orderId) || 'N/A';

  const parsedAmount = Number(amount);
  const normalizedAmount = Number.isFinite(parsedAmount)
    ? Math.round((parsedAmount + Number.EPSILON) * 100) / 100
    : NaN;
  const selectedRefundType: 'full' | 'partial' =
    actionType === 'void' ? 'full' : refundType;
  const partialAmountInvalid =
    selectedRefundType === 'partial' &&
    (!amount || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0);
  const reasonMissing = reason.trim().length === 0;
  useEffect(() => {
    let isMounted = true;
    const orderId = String(data?.orderId || '').trim();
    if (!orderId) return () => undefined;

    const preferredAction = data?.preferredAction === 'void' ? 'void' : 'refund';
    setActionType(preferredAction);
    if (preferredAction === 'void') setRefundType('full');

    setActionLoading(true);
    setActionMessage('');

    orderClient
      .refundAction(orderId)
      .then((res: any) => {
        if (!isMounted) return;
        const payload = (res as any)?.data ?? res;
        const action = payload?.action === 'void' ? 'void' : 'refund';
        setActionType(action);
        if (Number.isFinite(Number(payload?.remainingRefundable))) {
          setRemainingRefundable(Number(payload.remainingRefundable));
        } else {
          setRemainingRefundable(null);
        }
        if (payload?.message) {
          setActionMessage(String(payload.message));
        }
        if (action === 'void') {
          setRefundType('full');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setActionType('refund');
        setRemainingRefundable(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setActionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [data?.orderId, data?.preferredAction]);

  const isSubmitDisabled = useMemo(
    () =>
      actionLoading ||
      isPending ||
      partialAmountInvalid ||
      reasonMissing ||
      (selectedRefundType === 'partial' &&
        remainingRefundable != null &&
        normalizedAmount > remainingRefundable),
    [
      actionLoading,
      isPending,
      partialAmountInvalid,
      reasonMissing,
      selectedRefundType,
      remainingRefundable,
      normalizedAmount,
    ],
  );

  const handleRefundTypeChange = (nextType: 'full' | 'partial') => {
    setRefundType(nextType);
    if (nextType === 'full') {
      setAmount('');
    }
    if (formError) setFormError('');
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    console.info('[RefundModal] refundType changed', {
      orderId: data?.orderId,
      actionType,
      refundType: selectedRefundType,
    });
  }, [data?.orderId, actionType, selectedRefundType]);

  const handleRefund = () => {
    if (isPending) return;

    const trimmedReason = reason.trim();
    const trimmedNotes = notes.trim();
    if (!trimmedReason) {
      setFormError(t('text-refund-reason-required', 'Reason is required.'));
      return;
    }
    if (partialAmountInvalid) {
      setFormError(t('text-refund-invalid-amount', 'Enter a valid refund amount.'));
      return;
    }
    if (
      selectedRefundType === 'partial' &&
      remainingRefundable != null &&
      normalizedAmount > remainingRefundable
    ) {
      setFormError(
        t(
          'text-refund-exceeds-remaining',
          `Refund amount exceeds remaining refundable balance ($${remainingRefundable.toFixed(2)}).`,
        ),
      );
      return;
    }

    setFormError('');
    const payload =
      selectedRefundType === 'partial'
        ? {
            id: data.orderId,
            amount: normalizedAmount,
            reason: trimmedReason,
            refundType: 'partial' as const,
            notes: trimmedNotes || undefined,
          }
        : {
            id: data.orderId,
            reason: trimmedReason,
            refundType: 'full' as const,
            notes: trimmedNotes || undefined,
          };

    refundOrder(payload, {
      onSuccess: () => {
        setReason('');
        setNotes('');
        setAmount('');
        closeModal();
      },
    });
  };

  return (
    <div className="flex flex-col bg-light h-full w-full rounded p-6 sm:w-[500px]">
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-dashed border-gray-200">
        <div>
          <h3 className="text-xl font-semibold text-heading mb-1">
            {t('text-refund-order')}
          </h3>
          <p className="text-lg text-gray-700 tracking-wider font-medium">
            {displayId}
          </p>
        </div>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-600 transition duration-200 mt-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded text-sm leading-relaxed">
        <p className="font-bold mb-1">{t('text-important-refund-info')}</p>
        <p dangerouslySetInnerHTML={{ __html: t('text-refund-full-desc') as string }} />
        <p className="mt-2" dangerouslySetInnerHTML={{ __html: t('text-refund-partial-desc') as string }} />
        <p className="mt-2 text-xs opacity-90">
          {t('text-refund-credit-desc')}
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4 pointer-events-auto">
        <label htmlFor="refund-type-full" className="flex items-center gap-2 cursor-pointer">
          <input
            id="refund-type-full"
            type="radio"
            name="refundType"
            value="full"
            checked={selectedRefundType === 'full'}
            onChange={(e) => handleRefundTypeChange(e.currentTarget.value as 'full')}
            disabled={actionType === 'void' || isPending}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">{t('text-full-refund', 'Full Refund')}</span>
        </label>
        
        <label htmlFor="refund-type-partial" className="flex items-center gap-2 cursor-pointer">
          <input
            id="refund-type-partial"
            type="radio"
            name="refundType"
            value="partial"
            checked={selectedRefundType === 'partial'}
            onChange={(e) => handleRefundTypeChange(e.currentTarget.value as 'partial')}
            disabled={actionType === 'void' || isPending}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">{t('text-partial-refund', 'Partial Refund')}</span>
        </label>
      </div>

      {actionType === 'void' && (
        <div className="mb-4 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {actionMessage || t('text-payment-not-settled-voiding', 'Payment not settled yet, voiding instead')}
        </div>
      )}

      {selectedRefundType === 'partial' && (
        <div className="mb-6">
          <Input
            label={t('text-refund-amount-usd', 'Refund Amount (USD)')}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={remainingRefundable != null ? String(remainingRefundable) : undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('text-enter-amount-to-refund', 'Enter amount to refund')}
            variant="outline"
            className="mb-4"
          />
          <p className="text-xs text-gray-500">
            {remainingRefundable != null ? (
              <span className="block">
                {t('text-maximum-refundable', 'Maximum refundable:')}{' '}
                <span className="font-semibold">${remainingRefundable.toFixed(2)}</span>
              </span>
            ) : null}
            <span className="block mt-1">
              {t('text-refund-limit-desc')}
            </span>
          </p>
        </div>
      )}

      <div className="mb-5">
        <Input
          label={t('text-refund-reason', 'Reason')}
          name="reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (formError) setFormError('');
          }}
          placeholder={t('text-refund-reason-placeholder', 'Enter reason for refund')}
          variant="outline"
          required
          className="mb-4"
        />
        <Input
          label={t('text-refund-notes', 'Notes (Optional)')}
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('text-refund-notes-placeholder', 'Add internal notes')}
          variant="outline"
        />
      </div>

      {formError && (
        <div className="mb-4 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="flex gap-4 mt-auto">
        <Button
          variant="outline"
          onClick={closeModal}
          className="w-1/2"
        >
          {t('text-cancel')}
        </Button>
        <Button
          onClick={handleRefund}
          loading={isPending}
          disabled={isSubmitDisabled}
          className="w-1/2 bg-red-600 hover:bg-red-700"
        >
          {actionType === 'void'
            ? t('text-process-void-payment', 'Void Payment')
            : selectedRefundType === 'full'
              ? t('text-process-full-refund', 'Process Full Refund')
              : t('text-process-partial-refund', 'Process Partial Refund')}
        </Button>
      </div>
    </div>
  );
};

export default RefundModal;
