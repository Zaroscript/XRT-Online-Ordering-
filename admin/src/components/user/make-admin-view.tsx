import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useUpdateUserMutation } from '@/data/user';

const MakeAdminView = () => {
  const { mutate: updateUser, isLoading: loading } = useUpdateUserMutation();
  const { data } = useModalState();

  const { closeModal } = useModalAction();

  async function handleMakeAdmin() {
    updateUser({ id: data, input: { role: 'super_admin' } });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleMakeAdmin}
      deleteBtnText="text-yes"
      title="text-make-admin"
      description="text-description-make-admin"
      deleteBtnLoading={loading}
    />
  );
};

export default MakeAdminView;
