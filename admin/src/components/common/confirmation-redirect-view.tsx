import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';

const ConfirmationRedirectView = () => {
  const { t } = useTranslation('common');
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
      title="form:form-title-unsaved-changes"
      description="form:form-description-unsaved-changes"
      deleteBtnText="form:button-label-leave"
      cancelBtnText="form:button-label-stay"
      deleteBtnClassName="!bg-accent hover:!bg-accent-hover focus:!bg-accent-hover"
      cancelBtnClassName="!bg-red-600 hover:!bg-red-700 focus:!bg-red-700"
      icon={
        <div className="flex justify-center mb-5">
          <span className="w-16 h-16 flex items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </span>
        </div>
      }
    />
  );
};

export default ConfirmationRedirectView;
