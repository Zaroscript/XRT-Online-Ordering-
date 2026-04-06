import Modal from '@/components/ui/modal/modal';
import dynamic from 'next/dynamic';
import { MODAL_VIEWS, useModalAction, useModalState } from './modal.context';

const TestimonialDeleteView = dynamic(
  () => import('@/components/testimonials/testimonial-delete-view'),
);
const TagDeleteView = dynamic(() => import('@/components/tag/tag-delete-view'));

const BanCustomerView = dynamic(
  () => import('@/components/user/user-ban-view'),
);
const KitchenSectionDeleteView = dynamic(
  () => import('@/components/kitchen-section/kitchen-section-delete-view'),
);
const PrinterDeleteView = dynamic(
  () => import('@/components/printer/printer-delete-view'),
);
const UserWalletPointsAddView = dynamic(
  () => import('@/components/user/user-wallet-points-add-view'),
);
const MakeAdminView = dynamic(
  () => import('@/components/user/make-admin-view'),
);
const UserRoleAssignmentView = dynamic(
  () => import('@/components/user/user-role-assignment-view'),
);
const UserPermissionsView = dynamic(
  () => import('@/components/user/user-permissions-view'),
);
const UserUpdateView = dynamic(
  () => import('@/components/user/user-update-view'),
);

const CategoryDeleteView = dynamic(
  () => import('@/components/category/category-delete-view'),
);
const ImportCategories = dynamic(
  () => import('@/components/category/import-categories'),
);
const ImportSessionDeleteView = dynamic(
  () => import('@/components/import/import-session-delete-view'),
);
const RollbackImportSessionView = dynamic(
  () => import('@/components/import/import-session-rollback-view'),
);
const ClearImportHistoryView = dynamic(
  () => import('@/components/import/import-history-clear-view'),
);
const CouponDeleteView = dynamic(
  () => import('@/components/coupon/coupon-delete-view'),
);
const RoleDeleteView = dynamic(
  () => import('@/components/role/role-delete-view'),
);
const UserDeleteView = dynamic(
  () => import('@/components/user/user-delete-view'),
);

const ProductDeleteView = dynamic(
  () => import('@/components/product/product-delete-view'),
);
const TypeDeleteView = dynamic(
  () => import('@/components/group/group-delete-view'),
);
const AttributeDeleteView = dynamic(
  () => import('@/components/attribute/attribute-delete-view'),
);

const ItemDeleteView = dynamic(
  () => import('@/components/item/item-delete-view'),
);
const ItemSizeDeleteView = dynamic(
  () => import('@/components/item/item-size-delete-view'),
);

const ItemToggleView = dynamic(
  () => import('@/components/item/item-toggle-view'),
);

const ItemPreviewView = dynamic(
  () => import('@/components/item/item-preview-view'),
);

const ApproveShopView = dynamic(
  () => import('@/components/shop/approve-shop-view'),
);
const DisApproveShopView = dynamic(
  () => import('@/components/shop/disapprove-shop-view'),
);
const RemoveStaffView = dynamic(
  () => import('@/components/shop/staff-delete-view'),
);

const ExportImportView = dynamic(
  () => import('@/components/product/import-export-modal'),
);

const AttributeExportImport = dynamic(
  () => import('@/components/attribute/attribute-import-export'),
);

const ReviewImageModal = dynamic(
  () => import('@/components/reviews/review-image-modal'),
);
const ReviewDeleteView = dynamic(
  () => import('@/components/reviews/review-delete-view'),
);

const AcceptAbuseReportView = dynamic(
  () => import('@/components/reviews/acccpt-report-confirmation'),
);

const DeclineAbuseReportView = dynamic(
  () => import('@/components/reviews/decline-report-confirmation'),
);

const RefundModal = dynamic(
  () => import('@/components/order/refund-modal'),
);

const CreateOrUpdateAddressForm = dynamic(
  () => import('@/components/address/create-or-update'),
);

const AuthorDeleteView = dynamic(
  () => import('@/components/author/author-delete-view'),
);
const ManufacturerDeleteView = dynamic(
  () => import('@/components/manufacturer/manufacturer-delete-view'),
);

const AbuseReport = dynamic(() => import('@/components/reviews/abuse-report'));
const OpenAiModal = dynamic(() => import('@/components/openAI/openAI.modal'));
const ComposerMessage = dynamic(
  () => import('@/components/message/compose-message'),
);

const SearchModal = dynamic(
  () => import('@/components/layouts/topbar/search-modal'),
);
const DescriptionView = dynamic(
  () => import('@/components/shop-single/description-modal'),
);
const ApproveCouponView = dynamic(
  () => import('@/components/coupon/approve-coupon-view'),
);
const DisApproveCouponView = dynamic(
  () => import('@/components/coupon/disapprove-coupon-view'),
);

const TransferShopOwnershipView = dynamic(
  () => import('@/components/shop/transfer-shop-ownership-view'),
);

const DeleteOwnershipTransferRequest = dynamic(
  () =>
    import('@/components/ownership-transfer/ownership-transfer-delete-view'),
);

const CreateAdminView = dynamic(
  () => import('@/components/admin/create-admin-view'),
);

const AdminPermissionsView = dynamic(
  () => import('@/components/admin/admin-permissions-view'),
);
const CategoryToggleView = dynamic(
  () => import('@/components/category/category-toggle-view'),
);

const ModifierGroupDeleteView = dynamic(
  () => import('@/components/modifier-group/modifier-group-delete-view'),
);

const ModifierGroupToggleView = dynamic(
  () => import('@/components/modifier-group/modifier-group-toggle-view'),
);

const ModifierDeleteView = dynamic(
  () => import('@/components/modifier/modifier-delete-view'),
);

const ModifierToggleView = dynamic(
  () => import('@/components/modifier/modifier-toggle-view'),
);

const ViewDetailsModal = dynamic(
  () => import('@/components/common/view-details-modal'),
);

const CampaignDetailsModal = dynamic(
  () => import('@/components/marketing/campaign-details-modal'),
);

const ConfirmationRedirectView = dynamic(
  () => import('@/components/common/confirmation-redirect-view'),
);
const ConfirmationModalView = dynamic(
  () => import('@/components/common/confirmation-modal-view'),
);

function renderModal(view: MODAL_VIEWS | undefined, data: any) {
  switch (view) {
    case 'CONFIRM_ACTION':
      return <ConfirmationModalView />;
    case 'CONFIRM_REDIRECT':
      return <ConfirmationRedirectView />;
    case 'DELETE_PRODUCT':
      return <ProductDeleteView />;
    case 'DELETE_TYPE':
      return <TypeDeleteView />;
    case 'DELETE_ATTRIBUTE':
      return <AttributeDeleteView />;
    case 'DELETE_CATEGORY':
      return <CategoryDeleteView />;
    case 'IMPORT_CATEGORIES':
      return <ImportCategories />;
    case 'DELETE_IMPORT_SESSION':
      return <ImportSessionDeleteView />;
    case 'ROLLBACK_IMPORT_SESSION':
      return <RollbackImportSessionView />;
    case 'CLEAR_IMPORT_HISTORY':
      return <ClearImportHistoryView />;
    case 'TOGGLE_CATEGORY_STATUS':
      return <CategoryToggleView />;
    case 'DELETE_MODIFIER_GROUP':
      return <ModifierGroupDeleteView />;
    case 'TOGGLE_MODIFIER_GROUP_STATUS':
      return <ModifierGroupToggleView />;
    case 'DELETE_MODIFIER':
      return <ModifierDeleteView />;
    case 'TOGGLE_MODIFIER_STATUS':
      return <ModifierToggleView />;

    case 'DELETE_ROLE':
      return <RoleDeleteView />;
    case 'DELETE_ITEM':
      return <ItemDeleteView />;
    case 'DELETE_ITEM_SIZE':
      return <ItemSizeDeleteView />;
    case 'TOGGLE_ITEM_STATUS':
      return <ItemToggleView />;
    case 'ITEM_PREVIEW':
      return <ItemPreviewView />;
    case 'DELETE_USER':
      return <UserDeleteView />;
    case 'REFUND_ORDER':
      return <RefundModal />;

    case 'DELETE_TAG':
      return <TagDeleteView />;
    case 'DELETE_MANUFACTURER':
      return <ManufacturerDeleteView />;
    case 'DELETE_AUTHOR':
      return <AuthorDeleteView />;
    case 'DELETE_KITCHEN_SECTION':
      return <KitchenSectionDeleteView />;
    case 'DELETE_PRINTER':
      return <PrinterDeleteView />;
    case 'BAN_CUSTOMER':
      return <BanCustomerView />;
    case 'SHOP_APPROVE_VIEW':
      return <ApproveShopView />;
    case 'SHOP_DISAPPROVE_VIEW':
      return <DisApproveShopView />;
    case 'DELETE_STAFF':
      return <RemoveStaffView />;

    case 'ADD_OR_UPDATE_ADDRESS':
      return <CreateOrUpdateAddressForm />;

    case 'MAKE_ADMIN':
      return <MakeAdminView />;
    case 'ASSIGN_ROLE':
      return <UserRoleAssignmentView />;
    case 'USER_PERMISSIONS':
      return <UserPermissionsView />;
    case 'EDIT_PROFILE':
      return <UserUpdateView />;
    case 'EXPORT_IMPORT_PRODUCT':
      return <ExportImportView />;
    case 'EXPORT_IMPORT_ATTRIBUTE':
      return <AttributeExportImport />;
    case 'ADD_WALLET_POINTS':
      return <UserWalletPointsAddView />;

    case 'DELETE_REVIEW':
      return <ReviewDeleteView />;
    case 'DELETE_TESTIMONIAL':
      return <TestimonialDeleteView />;
    case 'ACCEPT_ABUSE_REPORT':
      return <AcceptAbuseReportView />;
    case 'DECLINE_ABUSE_REPORT':
      return <DeclineAbuseReportView />;
    case 'REVIEW_IMAGE_POPOVER':
      return <ReviewImageModal />;
    case 'ABUSE_REPORT':
      return <AbuseReport data={data} />;
    case 'GENERATE_DESCRIPTION':
      return <OpenAiModal />;
    case 'COMPOSE_MESSAGE':
      return <ComposerMessage />;
    case 'SEARCH_VIEW':
      return <SearchModal />;
    case 'DESCRIPTION_VIEW':
      return <DescriptionView />;

    case 'COUPON_APPROVE_VIEW':
      return <ApproveCouponView />;
    case 'COUPON_DISAPPROVE_VIEW':
      return <DisApproveCouponView />;
    case 'DELETE_COUPON':
      return <CouponDeleteView />;
    case 'TRANSFER_SHOP_OWNERSHIP_VIEW':
      return <TransferShopOwnershipView />;
    case 'DELETE_OWNERSHIP_TRANSFER_REQUEST':
      return <DeleteOwnershipTransferRequest />;
    case 'CREATE_ADMIN':
      return <CreateAdminView />;
    case 'ADMIN_PERMISSIONS_VIEW':
      return <AdminPermissionsView />;
    case 'VIEW_DETAILS':
      return <ViewDetailsModal />;
    case 'CAMPAIGN_DETAILS_VIEW':
      return <CampaignDetailsModal />;
    default:
      return null;
  }
}

const ManagedModal = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <Modal open={isOpen} onClose={closeModal}>
      {renderModal(view, data)}
    </Modal>
  );
};

export default ManagedModal;
