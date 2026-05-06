import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeletePromotionMutation } from '@/data/promotion';
import { toast } from 'react-toastify';

export default function PromotionDeleteView() {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deletePromotion, isPending: loading } =
    useDeletePromotionMutation();

  function handleDelete() {
    deletePromotion(
      { id: data },
      {
        onSuccess: () => closeModal(),
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message || 'Could not delete promotion',
          ),
      },
    );
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
}
