import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';

const ConfirmationModalView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  async function handleConfirm() {
    if (data?.onConfirm) {
      await data.onConfirm();
    }
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleConfirm}
      title={data?.title || 'button-delete'}
      description={data?.description || 'delete-item-confirm'}
      deleteBtnText={data?.deleteBtnText || 'button-delete'}
      cancelBtnText={data?.cancelBtnText || 'button-cancel'}
    />
  );
};

export default ConfirmationModalView;
