import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import Toast from '../Component/UI/Toast';

const CartContext = createContext();
const CART_STORAGE_KEY = 'xrt_cart';

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { cartItems: [], orderType: null, deliveryDetails: null };
    const data = JSON.parse(raw);
    const items = Array.isArray(data?.cartItems) ? data.cartItems : [];
    const cartItems = items.filter((item) => item != null && item.id != null && Number(item.qty) > 0);
    const orderType = data?.orderType === 'pickup' || data?.orderType === 'delivery' ? data.orderType : null;
    const deliveryDetails = data?.deliveryDetails && typeof data.deliveryDetails === 'object' ? data.deliveryDetails : null;
    return { cartItems, orderType, deliveryDetails };
  } catch {
    return { cartItems: [], orderType: null, deliveryDetails: null };
  }
}

function saveCartToStorage(cartItems, orderType, deliveryDetails) {
  try {
    const payload = { cartItems: cartItems ?? [], orderType: orderType ?? null, deliveryDetails: deliveryDetails ?? null };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function emitCartLifecycleEvent(name, detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [persisted, setPersisted] = useState(loadCartFromStorage);
  const { cartItems, orderType, deliveryDetails } = persisted;
  const previousCartCountRef = useRef(cartItems.length);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const setCartItems = useCallback((updater) => {
    setPersisted((prev) => {
      const nextItems = typeof updater === 'function' ? updater(prev.cartItems) : updater;
      const next = { ...prev, cartItems: nextItems };
      saveCartToStorage(next.cartItems, next.orderType, next.deliveryDetails);
      return next;
    });
  }, []);

  const setOrderType = useCallback((value) => {
    setPersisted((prev) => {
      const next = { ...prev, orderType: value };
      saveCartToStorage(next.cartItems, next.orderType, next.deliveryDetails);
      return next;
    });
  }, []);

  const setDeliveryDetails = useCallback((value) => {
    setPersisted((prev) => {
      const nextDetails = typeof value === 'function' ? value(prev.deliveryDetails) : value;
      const next = { ...prev, deliveryDetails: nextDetails };
      saveCartToStorage(next.cartItems, next.orderType, next.deliveryDetails);
      return next;
    });
  }, []);

  // Reset orderType when cart becomes empty
  React.useEffect(() => {
    if (cartItems.length === 0 && orderType !== null) {
      setOrderType(null);
    }
  }, [cartItems.length, orderType, setOrderType]);

  React.useEffect(() => {
    const previousCount = previousCartCountRef.current;
    if (previousCount > 0 && cartItems.length === 0) {
      emitCartLifecycleEvent('xrt:cart-emptied', { reason: 'cart-became-empty' });
    }
    previousCartCountRef.current = cartItems.length;
  }, [cartItems.length]);

  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const addToCart = (product, quantity = 1) => {
    // Ensure we are using the most up-to-date product data including suggested_products
    // In case the passed product is a partial or from an old cache
    setCartItems(prev => {
      // Helper to generate a unique signature for the item options
      const getSignature = (item) => {
         const sortModifiers = (mods) => {
            if (!mods) return {};
            return Object.keys(mods).sort().reduce((acc, key) => {
               const value = mods[key];
               if (Array.isArray(value)) {
                  acc[key] = [...value].sort();
               } else if (typeof value === 'object' && value !== null) {
                   acc[key] = Object.keys(value).sort().reduce((subAcc, subKey) => {
                       subAcc[subKey] = value[subKey];
                       return subAcc;
                   }, {});
               } else {
                  acc[key] = value;
               }
               return acc;
            }, {});
         };

         return JSON.stringify({
           id: item.id,
           size: item.size || null,
           modifiers: sortModifiers(item.modifiers)
         });
      };

      const incomingSig = getSignature(product);
      const existingIndex = prev.findIndex(item => getSignature(item) === incomingSig);

      if (existingIndex >= 0) {
        // Update quantity if exact item exists
        const newCart = [...prev];
        newCart[existingIndex] = {
           ...newCart[existingIndex],
           qty: newCart[existingIndex].qty + quantity,
           // Preserve or update suggestions if they come with the product
           suggested_products: product.suggested_products || newCart[existingIndex].suggested_products
        };
        return newCart;
      }
      
      // Add new item
      return [...prev, { ...product, qty: quantity }];
    });
    showToast("Added to cart");
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
      const price = typeof p === 'number' ? p : parseFloat(String(p || '0').replace(/[^\d.]/g, '')) || 0;
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

  const clearCart = useCallback(() => {
    const hadItems = cartItems.length > 0;
    const empty = { cartItems: [], orderType: null, deliveryDetails: null };
    setPersisted(empty);
    saveCartToStorage([], null, null);
    emitCartLifecycleEvent('xrt:cart-cleared', { hadItems });
  }, [cartItems.length]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
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
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={hideToast} 
      />
      {children}
    </CartContext.Provider>
  );
}
