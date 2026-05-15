import { useReprintOrderMutation } from '@/data/order';
import { PrinterIcon } from '@/components/icons/printer-icon';
import { toast } from 'react-toastify';
import cn from 'classnames';

interface PrintOrderButtonProps {
  orderId: string;
  className?: string;
}

/**
 * Sends the order to the thermal printer via POST /orders/:id/reprint.
 * Works for every order status — pending, in-progress, completed, cancelled.
 */
export default function PrintOrderButton({ orderId, className }: PrintOrderButtonProps) {
  const { mutate: reprint, isPending } = useReprintOrderMutation();

  const handlePrint = () => {
    console.log('[PrintOrderButton] Sending order to printer:', orderId);
    reprint(
      { id: orderId },
      {
        onSuccess: () => {
          console.log('[PrintOrderButton] Print command accepted for order:', orderId);
          toast.success('Receipt sent to printer');
        },
        onError: (e: any) => {
          const msg = e?.response?.data?.message ?? e?.message ?? 'Print failed';
          console.error('[PrintOrderButton] Print error for order:', orderId, msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={isPending}
      title="Print order receipt"
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 uppercase tracking-widest transition-colors hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
        isPending && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <PrinterIcon className="h-3.5 w-3.5 shrink-0" />
      <span>{isPending ? 'Printing…' : 'Print'}</span>
    </button>
  );
}
