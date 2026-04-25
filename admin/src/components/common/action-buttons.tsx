import { AdminIcon } from '@/components/icons/admin-icon';
import { BanUser } from '@/components/icons/ban-user';
import { EyeIcon } from '@/components/icons/category/eyes-icon';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { EditIcon } from '@/components/icons/edit';
import { Eye } from '@/components/icons/eye-icon';
import { TrashIcon } from '@/components/icons/trash';
import { WalletPointsIcon } from '@/components/icons/wallet-point';
import Link from '@/components/ui/link';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { getAuthCredentials } from '@/utils/auth-utils';
import { STAFF, SUPER_ADMIN } from '@/utils/constants';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { approveModalInitialValues } from '@/utils/constants';
import { useAtom } from 'jotai';
import { ExternalLinkIcon } from '@/components/icons/external-link';
import { Tooltip } from '@/components/ui/tooltip';

type Props = {
  id: string;
  editModalView?: string | any;
  deleteModalView?: string | any;
  editUrl?: string;
  previewUrl?: string;
  enablePreviewMode?: boolean;
  detailsUrl?: string;
  isUserActive?: boolean;
  userStatus?: boolean;
  isShopActive?: boolean;
  approveButton?: boolean;
  couponApproveButton?: boolean;
  showAddWalletPoints?: boolean;
  changeRefundStatus?: boolean;
  showMakeAdminButton?: boolean;
  customLocale?: string;
  isCouponApprove?: boolean;
  transferShopOwnership?: boolean;
  showViewDetails?: boolean;
  viewDetailsData?: any;
  data?: {
    [key: string]: string | boolean | number;
  };
  disabled?: boolean;
};

const ActionButtons = ({
  id,
  editModalView,
  deleteModalView,
  editUrl,
  previewUrl,
  enablePreviewMode = false,
  detailsUrl,
  userStatus = false,
  isUserActive = false,
  isShopActive,
  approveButton = false,
  showAddWalletPoints = false,
  changeRefundStatus = false,
  showMakeAdminButton = false,
  customLocale,
  couponApproveButton,
  isCouponApprove,
  transferShopOwnership,
  showViewDetails = false,
  viewDetailsData,
  data,
  disabled,
}: Props) => {
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const router = useRouter();
  const { role } = getAuthCredentials();
  const [_, setApproveModal] = useAtom(approveModalInitialValues);

  function handleDelete() {
    if (deleteModalView === 'DELETE_CUSTOMER') {
      openModal(deleteModalView, {
        id,
        customerName: String(data?.customer_name || ''),
      });
      return;
    }
    openModal(deleteModalView, id);
  }

  function handleViewDetails() {
    openModal('VIEW_DETAILS', viewDetailsData);
  }

  function handleEditModal() {
    openModal(editModalView, id);
  }

  function handleUserStatus(type: string) {
    openModal('BAN_CUSTOMER', { id, type });
  }

  function handleAddWalletPoints() {
    openModal('ADD_WALLET_POINTS', id);
  }

  function handleMakeAdmin() {
    openModal('ASSIGN_ROLE', id);
  }

  function handleUpdateRefundStatus() {
    openModal('UPDATE_REFUND', id);
  }

  function handleShopStatus(status: boolean) {
    if (status === true) {
      openModal('SHOP_APPROVE_VIEW', { id, data });
      if (Boolean(data?.multiCommission)) {
        setApproveModal(true);
      }
    } else {
      openModal('SHOP_DISAPPROVE_VIEW', id);
    }
  }

  function handleCouponStatus(status: boolean) {
    if (status === true) {
      openModal('COUPON_APPROVE_VIEW', id);
    } else {
      openModal('COUPON_DISAPPROVE_VIEW', id);
    }
  }

  const handleTransferOwnership = () => {
    if (!disabled) {
      openModal('TRANSFER_SHOP_OWNERSHIP_VIEW', data);
    }
  };

  // TODO: need to be checked about last coupon code.

  return (
    <div className="inline-flex items-center w-auto gap-3">
      {showViewDetails && (
        <button
          onClick={handleViewDetails}
          className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
          title={t('common:text-view-details')}
        >
          <EyeIcon width={18} />
        </button>
      )}
      {showMakeAdminButton && (
        <button
          onClick={handleMakeAdmin}
          className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
          title={t('common:text-update-role')}
        >
          <AdminIcon width={17} />
        </button>
      )}
      {showAddWalletPoints && (
        <button
          onClick={handleAddWalletPoints}
          className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
          title={t('common:text-add-wallet-points')}
        >
          <WalletPointsIcon width={18} />
        </button>
      )}

      {changeRefundStatus && (
        <button
          onClick={handleUpdateRefundStatus}
          className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
          title={t('common:text-change-refund-status')}
        >
          <CheckMarkCircle width={20} />
        </button>
      )}

      {/* NEW REFUND BUTTON FOR ORDER HISTORY */}
      {((data?.payment_status as string) === 'paid' ||
        (data?.payment_status as string) === 'partially_refunded' ||
        (data?.payment_status as string) === 'pending') &&
      (data?.payment_status as string) !== 'refunded' ? (
        <button
          onClick={() =>
            openModal('REFUND_ORDER', {
              orderId: id,
              totalAmount: data?.total_amount,
              trackingNumber: data?.tracking_number,
              preferredAction:
                (data?.payment_status as string) === 'pending' ? 'void' : 'refund',
            })
          }
          className="transition duration-200 text-red-500 hover:text-red-700 font-medium text-xs border border-red-500 rounded px-2 py-1 ml-2 focus:outline-none"
          title={(data?.payment_status as string) === 'pending' ? 'Void Payment' : 'Refund Order'}
        >
          {(data?.payment_status as string) === 'pending' ? 'Void Payment' : 'Refund'}
        </button>
      ) : null}

      {editModalView && (
        <button
          onClick={handleEditModal}
          className="transition duration-200 text-body hover:text-heading focus:outline-none"
          title={t('common:text-edit')}
        >
          <EditIcon width={16} />
        </button>
      )}
      {approveButton &&
        (!isShopActive ? (
          <button
            onClick={() => handleShopStatus(true)}
            className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
            title={t('common:text-approve-shop')}
          >
            <CheckMarkCircle width={16} />
          </button>
        ) : (
          <button
            onClick={() => handleShopStatus(false)}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-disapprove-shop')}
          >
            <CloseFillIcon width={16} />
          </button>
        ))}

      {couponApproveButton &&
        role === SUPER_ADMIN &&
        (!isCouponApprove ? (
          <button
            onClick={() => handleCouponStatus(true)}
            className="ml-3 transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
            title={t('common:text-approve-coupon')}
          >
            <CheckMarkCircle width={18} />
          </button>
        ) : (
          <button
            onClick={() => handleCouponStatus(false)}
            className="ml-3 text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-disapprove-coupon')}
          >
            <CloseFillIcon width={18} />
          </button>
        ))}

      {userStatus && (
        <>
          {isUserActive ? (
            <button
              onClick={() => handleUserStatus('ban')}
              className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
              title={t('common:text-ban-user')}
            >
              <BanUser width={16} />
            </button>
          ) : (
            <button
              onClick={() => handleUserStatus('active')}
              className="transition duration-200 text-accent hover:text-accent focus:outline-none"
              title={t('common:text-activate-user')}
            >
              <CheckMarkCircle width={16} />
            </button>
          )}
        </>
      )}
      {editUrl && (
        <Link
          href={editUrl}
          className="text-base transition duration-200 hover:text-heading"
          title={t('common:text-edit')}
        >
          <EditIcon width={15} />
        </Link>
      )}
      {enablePreviewMode && (
        <>
          {previewUrl && (
            <Link
              href={previewUrl}
              className="text-base transition duration-200 hover:text-heading"
              title={t('common:text-preview')}
              target="_blank"
            >
              <EyeIcon width={18} />
            </Link>
          )}
        </>
      )}
      {detailsUrl && (
        <Link
          href={detailsUrl}
          className="text-base transition duration-200 hover:text-heading"
          title={t('common:text-view')}
          locale={customLocale}
        >
          <Eye className="w-5 h-5" />
        </Link>
      )}

      {deleteModalView &&
        (role !== STAFF ||
          router.asPath !== `/${router.query.shop}${Routes.coupon.list}`) && (
          <button
            onClick={handleDelete}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-delete')}
          >
            <TrashIcon width={14} />
          </button>
        )}

      {/* {deleteModalView && (
        <button
          onClick={handleDelete}
          className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
          title={t('common:text-delete')}
        >
          <TrashIcon width={14} />
        </button>
      )} */}

      {transferShopOwnership && (
        <Tooltip
          content={
            disabled
              ? 'Ownership transfer is disabled currently!'
              : t('text-transfer-shop-ownership-status')
          }
          placement="top-end"
          rounded="none"
        >
          <button
            disabled={disabled}
            onClick={handleTransferOwnership}
            className="transition duration-200 text-accent hover:text-accent-hover focus:outline-none"
          >
            <ExternalLinkIcon width={20} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;
