import React from 'react';
import { useCart } from '../context/CartContext';
import { COLORS } from '../config/colors';
import { X, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Helper to parse price string (e.g., "£746.64" -> 746.64)
  const getPriceValue = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  return (
    <div 
      className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto"
      style={{
        '--primary': COLORS.primary,
        '--text-primary': COLORS.textPrimary,
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[var(--primary)]" />
          Shopping Cart
        </h1>
      </div>

      {cartItems.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6 text-center">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                 const unitPrice = getPriceValue(item.price);
                 const lineTotal = unitPrice * item.qty;

                 return (
                <div key={item.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center group hover:bg-gray-50/50 transition-colors">
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl p-2 border border-gray-100 flex-shrink-0">
                      <img 
                        src={item.src} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-1 truncate">{item.name}</h3>
                      {/* <div className="md:hidden text-sm text-gray-500 mb-2">
                        {item.price} x {item.qty}
                      </div> */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-medium transition-colors"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center hidden md:block text-gray-600 font-medium">
                    {item.price}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-[var(--primary)]"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-[var(--primary)]"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="col-span-2 text-center hidden md:block font-bold text-[var(--primary)] text-lg">
                    £{lineTotal.toFixed(2)}
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-[var(--text-primary)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--primary)]">£{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 mb-4">
                PROCEED TO CHECKOUT
              </button>
              
              <Link to="/menu" className="block text-center text-gray-500 hover:text-[var(--primary)] font-medium transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md text-center">Looks like you haven't added any items to your cart yet. Browse our menu to find something you like!</p>
          <Link 
            to="/menu" 
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go to Menu
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
