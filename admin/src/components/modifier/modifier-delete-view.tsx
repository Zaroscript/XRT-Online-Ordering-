import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteModifierMutation } from '@/data/modifier';

const ModifierDeleteView = () => {
  const { mutate: deleteModifier, isPending: loading } =
    useDeleteModifierMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    deleteModifier({
      id: data?.id,
      modifier_group_id: data?.modifier_group_id,
    });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default ModifierDeleteView;
