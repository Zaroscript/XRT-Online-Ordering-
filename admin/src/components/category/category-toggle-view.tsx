import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useUpdateCategoryMutation } from '@/data/category';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { CloseFillIcon } from '@/components/icons/close-fill';

const CategoryToggleView = () => {
    const { mutate: updateCategory, isLoading: loading } = useUpdateCategoryMutation();
    const { data } = useModalState();
    const { closeModal } = useModalAction();

    function handleToggle() {
        updateCategory({
            id: data.id,
            ...data, // Send all data to be safe with PUT, but override is_active
            is_active: !data.is_active,
        }, {
            onSuccess: () => {
                closeModal();
            },
            onError: () => {
                closeModal();
            }
        });
    }

    const isActivating = !data.is_active;

    return (
        <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleToggle}
            deleteBtnLoading={loading}
            deleteBtnText={isActivating ? 'Enable' : 'Disable'}
            title={isActivating ? 'Enable Category' : 'Disable Category'}
            description={isActivating ? 'Are you sure you want to enable this category?' : 'Are you sure you want to disable this category?'}
            deleteBtnClassName={isActivating ? 'bg-accent hover:bg-accent-hover' : 'bg-red-600 hover:bg-red-700'}
            icon={isActivating ? <CheckMarkCircle className="w-12 h-12 m-auto mt-4 text-accent" /> : <CloseFillIcon className="w-12 h-12 m-auto mt-4 text-red-500" />}
        />
    );
};

export default CategoryToggleView;
