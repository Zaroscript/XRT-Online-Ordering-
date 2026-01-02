import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useUpdateItemMutation } from '@/data/item';

const ItemToggleView = () => {
    const { data } = useModalState();
    const { closeModal } = useModalAction();
    const { mutate: updateItem, isLoading: loading } = useUpdateItemMutation();

    function handleToggle() {
        updateItem({
            id: data.id,
            is_active: !data.is_active,
        });
        closeModal();
    }

    return (
        <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleToggle}
            deleteBtnLoading={loading}
            title="text-confirm-toggle"
            description="text-confirm-toggle-description"
            deleteBtnText="text-confirm"
        />
    );
};

export default ItemToggleView;
