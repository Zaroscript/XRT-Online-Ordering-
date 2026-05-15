import { useEffect, useMemo, useState } from 'react';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
import { customerClient } from '@/data/client/customer';
import {
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
} from '@/data/customer';

type DeletePayload =
  | string
  | {
      id?: string;
      customerName?: string;
    };

const CustomerDeleteView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomerMutation();
  const { mutate: updateCustomer, isPending: archiving } = useUpdateCustomerMutation();

  const payload = (data ?? {}) as DeletePayload;
  const customerId =
    typeof payload === 'string' ? payload : String(payload?.id || '');
  const customerName =
    typeof payload === 'string' ? '' : String(payload?.customerName || '');

  const [checking, setChecking] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [safetyMessage, setSafetyMessage] = useState('');
  const [counts, setCounts] = useState<{
    orders: number;
    loyaltyTransactions: number;
    paymentTransactions: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!customerId) return () => undefined;
    setChecking(true);
    customerClient
      .getDeleteSafety(customerId)
      .then((res: any) => {
        if (!mounted) return;
        const payloadData = (res as any)?.data ?? res;
        const history = Boolean(payloadData?.hasHistory);
        setHasHistory(history);
        setCounts(payloadData?.counts ?? null);
        if (history) {
          setSafetyMessage(
            'This customer has historical orders. Archive instead?',
          );
        } else {
          setSafetyMessage('');
        }
      })
      .catch(() => {
        if (!mounted) return;
        setHasHistory(false);
        setSafetyMessage('');
      })
      .finally(() => {
        if (!mounted) return;
        setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [customerId]);

  const busy = deleting || archiving || checking;
  const displayName = customerName?.trim() || 'this customer';

  const description = useMemo(() => {
    if (checking) return 'Checking customer history...';
    if (hasHistory) return safetyMessage;
    return `Are you sure you want to delete ${displayName}? This action cannot be undone.`;
  }, [checking, hasHistory, safetyMessage, displayName]);

  const handleConfirm = () => {
    if (!customerId || busy) return;
    if (hasHistory) {
      updateCustomer(
        {
          id: customerId,
          variables: { isActive: false },
        },
        {
          onSuccess: () => closeModal(),
        },
      );
      return;
    }
    deleteCustomer(customerId, {
      onSuccess: () => closeModal(),
    });
  };

  return (
    <div className="m-auto w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-heading">
          {hasHistory ? 'Archive Customer?' : 'Delete Customer?'}
        </h3>
        <p className="mt-2 text-sm leading-6 text-body">
          {description}
        </p>
        {hasHistory && counts && (
          <p className="mt-2 text-xs text-gray-500">
            Orders: {counts.orders} | Loyalty events: {counts.loyaltyTransactions} |
            Payments: {counts.paymentTransactions}
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={closeModal}
          variant="outline"
          disabled={busy}
          className="w-full"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          loading={deleting || archiving}
          disabled={busy && !deleting && !archiving}
          className={hasHistory ? 'w-full bg-amber-600 hover:bg-amber-700' : 'w-full bg-red-600 hover:bg-red-700'}
        >
          {hasHistory ? 'Archive Customer' : 'Delete Customer'}
        </Button>
      </div>
    </div>
  );
};

export default CustomerDeleteView;
