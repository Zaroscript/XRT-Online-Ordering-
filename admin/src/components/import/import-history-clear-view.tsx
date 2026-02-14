import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useClearImportHistoryMutation } from '@/data/import';

const ClearImportHistoryView = () => {
  const { closeModal } = useModalAction();
  const { mutate: clearHistory, isPending: loading } =
    useClearImportHistoryMutation();

  function handleClear() {
    clearHistory(undefined, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleClear}
      deleteBtnLoading={loading}
      deleteBtnText="text-clear-history"
      title="text-clear-import-history"
      description="text-clear-import-history-description"
      deleteBtnClassName="bg-red-500 hover:bg-red-600 focus:bg-red-600"
      cancelBtnClassName="bg-gray-200 hover:bg-gray-300 focus:bg-gray-300"
    />
  );
};

export default ClearImportHistoryView;
