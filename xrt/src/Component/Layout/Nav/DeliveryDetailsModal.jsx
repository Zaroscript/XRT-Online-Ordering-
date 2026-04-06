import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCart } from '../../../context/CartContext';
import { COLORS } from '../../../config/colors';
import { LoyaltyJoinCheckbox } from '../../../components/checkout/LoyaltyJoinCheckbox';
import { useLoyalty } from '../../../hooks/useLoyalty';

const DeliveryDetailsModal = () => {
  const { 
    showDeliveryModal, 
    setShowDeliveryModal, 
    setDeliveryDetails, 
    setOrderType,
    deliveryDetails 
  } = useCart();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  
  const watchFirstName = watch('firstName');
  const watchLastName = watch('lastName');
  const watchPhone = watch('phone');
  const watchEmail = watch('email');

  useEffect(() => {
    if (deliveryDetails) {
      setValue('firstName', deliveryDetails.firstName);
      setValue('lastName', deliveryDetails.lastName);
      setValue('phone', deliveryDetails.phone);
      setValue('address1', deliveryDetails.address1);
      setValue('apt', deliveryDetails.apt);
      setValue('city', deliveryDetails.city);
      setValue('state', deliveryDetails.state);
      setValue('zipcode', deliveryDetails.zipcode);
    }
  }, [deliveryDetails, setValue]);

  const onSubmit = (data) => {
    setDeliveryDetails(data);
    setOrderType('delivery');
    setShowDeliveryModal(false);
  };

  const handleClose = () => {
    setShowDeliveryModal(false);
  };

  return (
    <AnimatePresence>
      {showDeliveryModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-4xl shadow-2xl relative overflow-hidden flex flex-col h-full ring-1 ring-black/5 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              '--primary': COLORS.primary,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-accent/10 bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-(--primary)">
                <MapPin className="text-(--primary)" size={24} />
                Delivery Details
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("firstName", { required: "First name is required" })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                        errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("lastName", { required: "Last name is required" })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                        errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                      errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                    }`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                </div>

                {/* Address 1 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("address1", { required: "Address is required" })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                      errors.address1 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                    }`}
                    placeholder="123 Main St"
                  />
                  {errors.address1 && <span className="text-xs text-red-500">{errors.address1.message}</span>}
                </div>

                {/* Apt / Building (Optional) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Apt / Building <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    {...register("apt")}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all"
                    placeholder="Apt 4B, Building C"
                  />
                </div>

                {/* City, State, Zipcode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("city", { required: "City is required" })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                        errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("state", { required: "State is required" })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                        errors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && <span className="text-xs text-red-500">{errors.state.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Zipcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("zipcode", { required: "Zipcode is required" })}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-(--primary)/20 bg-gray-50/50 outline-none transition-all ${
                        errors.zipcode ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-(--primary)'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zipcode && <span className="text-xs text-red-500">{errors.zipcode.message}</span>}
                  </div>
                </div>

                {/* Loyalty Section */}
                <div className="pt-2">
                  <LoyaltyJoinCheckbox 
                    phone={watchPhone}
                    name={`${watchFirstName || ''} ${watchLastName || ''}`.trim()}
                    email={watchEmail}
                  />
                </div>

                <div className="pt-4 pb-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-(--primary) hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-(--primary)/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    <span>Save & Continue</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryDetailsModal;
