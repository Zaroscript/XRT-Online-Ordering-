import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';
import { products } from '../../../config/constants';


export default function CartPanel({ open, setclosefun }) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, addToCart, cartTotal, orderType } = useCart();
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Get suggested products (exclude items already in cart)
  const suggestedProducts = products
    .filter(p => !cartItems.find(item => item.id === p.id))
    .slice(0, 5); // Show first 5 matches

  const variants = {
    hidden: { x: '100%', transition: { duration: 0.45, ease: 'easeInOut' } },
    visible: { x: 0, transition: { duration: 0.45, ease: 'easeInOut' } },
    exit: { x: '100%', transition: { duration: 0.35, ease: 'easeInOut' } }
  };

  const overlayVariants = {
    hidden: { opacity: 0, pointerEvents: 'none' },
    visible: { opacity: 0.4, pointerEvents: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.2 } }
  };




  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setclosefun()}
          />
          
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            style={{
              '--primary': COLORS.primary,
              '--text-primary': COLORS.textPrimary,
            }}
            className="fixed top-0 right-0 h-screen w-[350px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[var(--primary)]" />
                Shopping Cart
              </h2>
              <button
                onClick={() => setclosefun()}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>





            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {cartItems.length > 0 ? (
                <div className="flex flex-col gap-6">

                    {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex-shrink-0 border border-gray-100">
                            <img 
                            src={item.src} 
                            alt={item.name} 
                            className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 leading-tight mb-1">
                            {item.name}
                            </h4>
                            <div className="text-sm text-gray-500 mb-2">
                            Price: {item.price}
                            </div>
                            <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-[var(--primary)]"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                            <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-[var(--primary)]"
                            >
                                <Plus size={14} />
                            </button>
                            </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                    <ShoppingBag size={48} className="text-gray-200" />
                    <p>Your cart is empty</p>
                    </div>
                )}
                </div>


            {/* Cross Selling Section */}
            {suggestedProducts.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[var(--primary)] rounded-full"></span>
                  You might also like
                </h3>
                
                <div className="relative group/scroll">
                  <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[var(--primary)] hover:scale-110 transition-all opacity-0 group-hover/scroll:opacity-100 disabled:opacity-0"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-hidden scroll-smooth pb-2 px-1"
                  >
                      {suggestedProducts.map((product) => {
                         const displayPrice = (product.basePrice * (product.sizes?.[0]?.multiplier || 1)).toFixed(2);
                         return (
                          <div 
                            key={product.id} 
                            className="flex-shrink-0 w-[140px] bg-white rounded-xl p-2 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                          >
                            <div className="relative h-24 mb-2 bg-gray-50 rounded-lg overflow-hidden">
                              <img 
                                src={product.src} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply p-1 group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={() => addToCart({ ...product, price: displayPrice })}
                                className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <h4 className="text-xs font-medium text-gray-700 line-clamp-1 mb-1" title={product.name}>
                              {product.name}
                            </h4>
                            <div className="text-xs font-bold text-[var(--primary)]">
                              ${displayPrice}
                            </div>
                          </div>
                      )})}
                  </div>

                  <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[var(--primary)] hover:scale-110 transition-all opacity-0 group-hover/scroll:opacity-100"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-xl font-bold text-[var(--primary)]">£{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    navigate('/cart');
                    setclosefun();
                  }}
                  className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-lg shadow-green-200 cursor-pointer text-sm tracking-wide"
                >
                  View Cart
                </button>
                <button className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-lg shadow-green-200 cursor-pointer text-sm tracking-wide">
                  Checkout
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

