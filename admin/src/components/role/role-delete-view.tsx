import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteRoleMutation } from '@/data/role';
import { getErrorMessage } from '@/utils/form-error';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

const RoleDeleteView = () => {
  const { t } = useTranslation('common');
  const { mutate: deleteRoleById, isPending: loading } =
    useDeleteRoleMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const roleId =
    typeof data === 'string'
      ? data
      : typeof data?.id === 'string'
        ? data.id
        : '';

  function handleDelete() {
    if (!roleId || roleId === 'undefined' || roleId === 'null') {
      toast.error(t('error-something-wrong'));
      return;
    }
    deleteRoleById(
      { id: roleId },
      {
        onSuccess: () => {
          closeModal();
        },
        onError: (error: unknown) => {
          const parsed = getErrorMessage(error);
          toast.error(parsed?.message || t('error-something-wrong'));
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

export default RoleDeleteView;
