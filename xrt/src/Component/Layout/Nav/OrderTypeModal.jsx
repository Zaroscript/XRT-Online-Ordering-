import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';

export default function OrderTypeModal() {
  const { cartItems, orderType, setOrderType, deliveryDetails, setShowDeliveryModal } = useCart();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (cartItems.length > 0 && !orderType) {
      setIsVisible(true);
    }
  }, [cartItems.length, orderType]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOrderTypeSelection = (type) => {
    if (type === 'delivery' && !deliveryDetails) {
      setShowDeliveryModal(true);
      setIsVisible(false); // Close this modal, open delivery modal
      return;
    }
    setOrderType(type);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {cartItems.length > 0 && !orderType && isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            '--primary': COLORS.primary,
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">How would you like your order?</h3>
              <p className="text-gray-500">Please select an option to continue</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleOrderTypeSelection('pickup')}
                className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[var(--primary)] hover:bg-green-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                     <ShoppingBag size={24} />
                  </div>
                  <span className="text-lg font-bold text-gray-700 group-hover:text-[var(--primary)]">Pick up</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-[var(--primary)] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--primary)] scale-0 group-hover:scale-100 transition-transform"/>
                </div>
              </button>

              <button
                onClick={() => handleOrderTypeSelection('delivery')}
                className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[var(--primary)] hover:bg-green-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                     {/* Using a simple Truck icon or similar if available, else generic map/pin */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <span className="text-lg font-bold text-gray-700 group-hover:text-[var(--primary)]">Delivery</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-[var(--primary)] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--primary)] scale-0 group-hover:scale-100 transition-transform"/>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
