import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteTestimonialMutation } from '@/data/testimonial';

const TestimonialDeleteView = () => {
  const { mutate: deleteTestimonial, isPending: loading } =
    useDeleteTestimonialMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    deleteTestimonial(
      { id: data },
      {
        onSettled: () => {
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

export default TestimonialDeleteView;
