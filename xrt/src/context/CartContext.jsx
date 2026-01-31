import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState(null); // 'pickup' or 'delivery'
  const [deliveryDetails, setDeliveryDetails] = useState(null); // { firstName, lastName, address }
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Reset orderType when cart becomes empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      setOrderType(null);
    }
  }, [cartItems]);


  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = item.price;
      const price = typeof p === 'string' ? parseFloat(p.replace(/[^\d.]/g, '')) : parseFloat(p);
      return acc + (price * item.qty);
    }, 0);
  }, [cartItems]);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, qty: item.qty + delta };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
    orderType,
    setOrderType,
    deliveryDetails,
    setDeliveryDetails,
    showDeliveryModal,
    setShowDeliveryModal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
