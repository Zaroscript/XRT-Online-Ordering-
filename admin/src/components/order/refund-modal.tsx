import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalState, useModalAction } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRefundOrderMutation } from '@/data/order';

const RefundModal = () => {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: refundOrder, isPending } = useRefundOrderMutation();

  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<string>('');

  const trackingStr = String(data?.trackingNumber ?? data?.orderId);
  const displayId = trackingStr.toUpperCase().startsWith('ORD') ? trackingStr : `ORD-${trackingStr}`;

  const handleRefund = () => {
    const payload = {
      id: data.orderId,
      amount: refundType === 'partial' ? parseFloat(amount) : undefined,
    };
    
    refundOrder(payload, {
      onSuccess: () => {
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

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="refundType"
            value="full"
            checked={refundType === 'full'}
            onChange={() => setRefundType('full')}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">{t('text-full-refund', 'Full Refund')}</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="refundType"
            value="partial"
            checked={refundType === 'partial'}
            onChange={() => setRefundType('partial')}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">{t('text-partial-refund', 'Partial Refund')}</span>
        </label>
      </div>

      {refundType === 'partial' && (
        <div className="mb-6">
          <Input
            label={t('text-refund-amount-usd', 'Refund Amount (USD)')}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('text-enter-amount-to-refund', 'Enter amount to refund')}
            variant="outline"
            className="mb-4"
          />
          <p className="text-xs text-gray-500">
            {t('text-order-total-reference', 'Order total (reference):')}{' '}
            <span className="font-bold">${data?.totalAmount ?? '—'}</span>
            <span className="block mt-1">
              {t('text-refund-limit-desc')}
            </span>
          </p>
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
          disabled={isPending || (refundType === 'partial' && (!amount || isNaN(Number(amount)) || Number(amount) <= 0))}
          className="w-1/2 bg-red-600 hover:bg-red-700"
        >
          {refundType === 'full' ? t('text-process-full-refund', 'Process Full Refund') : t('text-process-partial-refund', 'Process Partial Refund')}
        </Button>
      </div>
    </div>
  );
};

export default RefundModal;
