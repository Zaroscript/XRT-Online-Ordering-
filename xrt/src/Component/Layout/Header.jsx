import React, { useState } from 'react'
import Top_Navbar from './Nav/Top_Navbar';
import MiddleNav from './Nav/MiddleNav';
import SideMenu from './Nav/SideMenu';
import SubNav from './Nav/SubNav';
import CartPanel from './Nav/CartPanel';
import OrderTypeModal from './Nav/OrderTypeModal';
import DeliveryDetailsModal from './Nav/DeliveryDetailsModal';
import { useCart } from '../../context/CartContext';


const Header = () => {
  const [open,setopen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount, cartTotal } = useCart();

  function setclickfun()
  {
    setopen(true);
  }
  return (
    <header>
        <Top_Navbar address="123 Main Street, Anytown, USA" email="2g5ZV@example.com" />
        <MiddleNav count={cartCount} total={cartTotal.toFixed(2)} link={"/"} setclickfun={setclickfun} onCartClick={() => setCartOpen(true)} />
        <SubNav phone="123-456-7890" />
        <SideMenu open={open} setclosefun={() => setopen(false)} />
        <CartPanel open={cartOpen} setclosefun={() => setCartOpen(false)} />
        <OrderTypeModal />
        <DeliveryDetailsModal />
    </header>
  )
}

export default Header