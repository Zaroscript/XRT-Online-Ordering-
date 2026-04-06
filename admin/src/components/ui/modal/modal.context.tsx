import React from 'react';

export type MODAL_VIEWS =
  | 'DELETE_PRODUCT'
  | 'DELETE_ADDRESS'
  | 'DELETE_TYPE'
  | 'DELETE_ATTRIBUTE'
  | 'DELETE_CATEGORY'
  | 'DELETE_ORDER'
  | 'DELETE_COUPON'
  | 'DELETE_TAX'
  | 'DELETE_SHIPPING'
  | 'DELETE_ORDER_STATUS'
  | 'DELETE_TAG'
  | 'DELETE_MANUFACTURER'
  | 'DELETE_AUTHOR'
  | 'BAN_CUSTOMER'
  | 'SHOP_APPROVE_VIEW'
  | 'SHOP_DISAPPROVE_VIEW'
  | 'DELETE_STAFF'
  | 'ADD_WALLET_POINTS'
  | 'MAKE_ADMIN'
  | 'USER_PERMISSIONS'
  | 'EDIT_PROFILE'
  | 'UPDATE_REFUND'
  | 'ADD_OR_UPDATE_ADDRESS'
  | 'REFUND_IMAGE_POPOVER'
  | 'EXPORT_IMPORT_PRODUCT'
  | 'EXPORT_IMPORT_ATTRIBUTE'
  | 'DELETE_REVIEW'
  | 'ACCEPT_ABUSE_REPORT'
  | 'DECLINE_ABUSE_REPORT'
  | 'REVIEW_IMAGE_POPOVER'
  | 'ABUSE_REPORT'
  | 'GENERATE_DESCRIPTION'
  | 'COMPOSE_MESSAGE'
  | 'SEARCH_VIEW'
  | 'DESCRIPTION_VIEW'
  | 'DELETE_REFUND_POLICY'
  | 'COUPON_APPROVE_VIEW'
  | 'COUPON_DISAPPROVE_VIEW'
  | 'DELETE_REFUND_REASON'
  | 'TRANSFER_SHOP_OWNERSHIP_VIEW'
  | 'DELETE_OWNERSHIP_TRANSFER_REQUEST'
  | 'DELETE_ROLE'
  | 'DELETE_USER'
  | 'ASSIGN_ROLE'
  | 'CREATE_ADMIN'
  | 'ADMIN_PERMISSIONS_VIEW'
  | 'DELETE_ITEM'
  | 'DELETE_ITEM_SIZE'
  | 'TOGGLE_ITEM_STATUS'
  | 'TOGGLE_CATEGORY_STATUS'
  | 'ITEM_PREVIEW'
  | 'IMPORT_CATEGORIES'
  | 'DELETE_MODIFIER_GROUP'
  | 'TOGGLE_MODIFIER_GROUP_STATUS'
  | 'DELETE_MODIFIER'
  | 'TOGGLE_MODIFIER_STATUS'
  | 'DELETE_IMPORT_SESSION'
  | 'ROLLBACK_IMPORT_SESSION'
  | 'CLEAR_IMPORT_HISTORY'
  | 'CONFIRM_REDIRECT'
  | 'CONFIRM_ACTION'
  | 'DELETE_TESTIMONIAL'
  | 'REFUND_ORDER'
  | 'DELETE_KITCHEN_SECTION'
  | 'DELETE_PRINTER'
  | 'VIEW_DETAILS'
  | 'CAMPAIGN_DETAILS_VIEW';

interface State {
  view?: MODAL_VIEWS;
  data?: any;
  isOpen: boolean;
}
type Action =
  | { type: 'open'; view?: MODAL_VIEWS; payload?: any }
  | { type: 'close' };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        view: action.view,
        data: action.payload,
        isOpen: true,
      };
    case 'close':
      return {
        ...state,
        view: undefined,
        data: null,
        isOpen: false,
      };
    default:
      throw new Error('Unknown Modal Action!');
  }
}

const ModalStateContext = React.createContext<State>(initialState);
ModalStateContext.displayName = 'ModalStateContext';
const ModalActionContext = React.createContext<
  React.Dispatch<Action> | undefined
>(undefined);
ModalActionContext.displayName = 'ModalActionContext';

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, initialState);
  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionContext.Provider value={dispatch}>
        {children}
      </ModalActionContext.Provider>
    </ModalStateContext.Provider>
  );
};

export function useModalState() {
  const context = React.useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error(`useModalState must be used within a ModalProvider`);
  }
  return context;
}

export function useModalAction() {
  const dispatch = React.useContext(ModalActionContext);
  if (dispatch === undefined) {
    throw new Error(`useModalAction must be used within a ModalProvider`);
  }
  return {
    openModal(view?: MODAL_VIEWS, payload?: unknown) {
      dispatch({ type: 'open', view, payload });
    },
    closeModal() {
      dispatch({ type: 'close' });
    },
  };
}
