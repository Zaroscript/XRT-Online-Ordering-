import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';

const OrderTypeModal = () => {
  const { cartItems, orderType, setOrderType, setShowDeliveryModal } = useCart();

  // Show modal if there are items in the cart but no order type selected
  const isOpen = cartItems.length > 0 && !orderType;

  const handleSelectType = (type) => {
    if (type === 'delivery') {
      setShowDeliveryModal(true);
    } else {
      setOrderType('pickup');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6" id="product_modal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-4xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-(--primary) p-6 text-center" style={{ backgroundColor: COLORS.primary }}>
              <h2 className="text-2xl font-bold text-white mb-2">How would you like your order?</h2>
              <p className="text-white/80">Please select your preferred method</p>
            </div>

            {/* Options */}
            <div className="p-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectType('pickup')}
                className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-(--primary) hover:bg-(--primary)/5 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Pick Up</h3>
                <span className="text-sm text-gray-500 mt-1">Collect at store</span>
              </button>

              <button
                onClick={() => handleSelectType('delivery')}
                className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Truck size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Delivery</h3>
                <span className="text-sm text-gray-500 mt-1">We bring it to you</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderTypeModal;
