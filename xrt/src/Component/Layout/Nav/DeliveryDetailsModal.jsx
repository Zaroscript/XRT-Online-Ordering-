import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';

export default function DeliveryDetailsModal() {
  const { cartItems, orderType, deliveryDetails, setDeliveryDetails, setOrderType, showDeliveryModal, setShowDeliveryModal } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to context
    setDeliveryDetails(formData);
    setOrderType('delivery');
    setShowDeliveryModal(false);
  };

  const handleClose = () => {
    setShowDeliveryModal(false);
  };

  return (
    <AnimatePresence>
      {showDeliveryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{ '--primary': COLORS.primary }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delivery Details</h3>
              <p className="text-gray-500">Please provide your details below</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName}</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  placeholder="123 Street Name, City, Country"
                />
                {errors.address && <span className="text-xs text-red-500 mt-1">{errors.address}</span>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[#2F5233] transition-colors mt-2"
              >
                Confirm Details
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
