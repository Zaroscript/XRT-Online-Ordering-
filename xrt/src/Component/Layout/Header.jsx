import React, { useState } from 'react'
import Top_Navbar from './Nav/Top_Navbar';
import MiddleNav from './Nav/MiddleNav';
import SideMenu from './Nav/SideMenu';
import SubNav from './Nav/SubNav';
import CartPanel from './Nav/CartPanel';
import OrderTypeModal from './Nav/OrderTypeModal';
import DeliveryDetailsModal from './Nav/DeliveryDetailsModal';
import { useCart } from '../../context/CartContext';


import { useSiteSettingsQuery } from '../../api/hooks/useSiteSettings';
import { resolveOperationsState } from '../../utils/operations';

import NotAcceptingOrders from '../Notice/NotAcceptingOrders';

const Header = () => {
  const [open,setopen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount, cartTotal } = useCart();
  const { data: settings } = useSiteSettingsQuery();
  
  const operationsState = settings?.operationsState || resolveOperationsState(settings || {});
  const isAcceptingOrders = operationsState?.allowsCheckout ?? true;
  const notAcceptingOrdersMessage =
    operationsState?.mode === "SCHEDULED_ONLY"
      ? "We are currently accepting scheduled orders only."
      : settings?.messages?.not_accepting_orders_message || "We are currently not accepting orders.";

  const contactDetails = settings?.contactDetails;
  const address = contactDetails?.formattedAddress || 
    (contactDetails?.address ? `${contactDetails.address.street || ''}, ${contactDetails.address.city || ''}` : '') ||
    "";
  const email = contactDetails?.emailAddress || "";
  const phone = contactDetails?.contact || "";

  function setclickfun()
  {
    setopen(true);
  }
  return (
    <header>
        {(!isAcceptingOrders || operationsState?.mode === "SCHEDULED_ONLY") && notAcceptingOrdersMessage && (
          <NotAcceptingOrders message={notAcceptingOrdersMessage} />
        )}
        <Top_Navbar address={address} phone={phone} email={email} />
        <MiddleNav count={cartCount} total={cartTotal.toFixed(2)} link={"/"} setclickfun={setclickfun} onCartClick={() => setCartOpen(true)} />
        <SubNav phone={phone} />
        <SideMenu open={open} setclosefun={() => setopen(false)} />
        <CartPanel open={cartOpen} setclosefun={() => setCartOpen(false)} />
        <OrderTypeModal />
        <DeliveryDetailsModal />
    </header>
  )
}

export default Header