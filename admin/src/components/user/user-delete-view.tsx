import ConfirmationCard from '@/components/common/confirmation-card';
import {
    useModalAction,
    useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteUserMutation } from '@/data/user';
import { useTranslation } from 'next-i18next';

const UserDeleteView = () => {
    const { t } = useTranslation(['form', 'common']);
    const { mutate: deleteUser, isLoading: loading } = useDeleteUserMutation();

    const { data: id } = useModalState();
    const { closeModal } = useModalAction();

    async function handleDelete() {
        deleteUser(id, {
            onSettled: () => {
                closeModal();
            },
        });
    }

    return (
        <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleDelete}
            deleteBtnLoading={loading}
            title={t('button-label-delete-user')}
            description={t('delete-user-confirm')}
            deleteBtnText={t('common:text-delete')}
            cancelBtnText={t('common:button-cancel')}
        />
    );
};

export default UserDeleteView;
