import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

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
      const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
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
    cartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
