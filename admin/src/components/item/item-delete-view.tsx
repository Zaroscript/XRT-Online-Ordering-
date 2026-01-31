import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteItemMutation } from '@/data/item';

const ItemDeleteView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deleteItem, isPending: loading } = useDeleteItemMutation();

  function handleDelete() {
    deleteItem(
      {
        id: data,
      },
      {
        onSuccess: () => {
          closeModal();
        },
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
};

export default ItemDeleteView;
