import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useBlockUserMutation, useUnblockUserMutation } from '@/data/user';

import { useTranslation } from 'next-i18next';

const CustomerBanView = () => {
  const { t } = useTranslation();
  const { mutate: blockUser, isLoading: loading } = useBlockUserMutation();
  const { mutate: unblockUser, isLoading: activeLoading } =
    useUnblockUserMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  async function handleDelete() {
    if (data?.type === 'ban') {
      blockUser({ id: data?.id });
    } else {
      unblockUser({ id: data?.id });
    }
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnText={data?.type === 'ban' ? t('common:text-block') : t('common:text-unblock')}
      title={data?.type === 'ban' ? t('common:text-block-customer') : t('common:text-unblock-customer')}
      description={data?.type === 'ban' ? t('common:text-block-confirm') : t('common:text-unblock-confirm')}
      deleteBtnLoading={loading || activeLoading}
    />
  );
};

export default CustomerBanView;
