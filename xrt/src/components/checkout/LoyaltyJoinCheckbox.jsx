import React, { useState } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoyaltyJoinCheckbox = ({ phone, name, email }) => {
  const { isEnrolled, join, isLoading, isActive } = useLoyalty();
  const { showToast } = useToast() || { showToast: () => {} };
  const [justJoinedPhone, setJustJoinedPhone] = useState('');
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  const trimmedName = String(name || '').trim();
  const justJoined = Boolean(normalizedPhone) && justJoinedPhone === normalizedPhone;

  // If already enrolled (but not just joined during this interaction) or program inactive, hide it
  if (
    !isActive ||
    normalizedPhone.length < 7 ||
    (!justJoined && isEnrolled)
  ) {
    return null;
  }

  const handleJoin = async (e) => {
    if (e.target.checked) {
      if (normalizedPhone.length < 7 || !trimmedName) {
        showToast("Please enter your name and a valid phone number first");
        e.target.checked = false;
        return;
      }
      const success = await join({ phone: normalizedPhone, name: trimmedName, email });
      if (success) setJustJoinedPhone(normalizedPhone);
      else e.target.checked = false; // Reset checkbox on failure
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-8 relative overflow-hidden group rounded-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/5 to-primary-hover/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/20 group-hover:ring-primary/40 transition-all duration-500" />

      <div className="relative p-5 sm:p-6 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.12)] transition-all duration-300">
        <label className="flex items-start gap-4 sm:gap-5 cursor-pointer relative z-10 w-full">
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center mt-1 group-hover:scale-105 transition-transform duration-200">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : isEnrolled ? (
              <CheckCircle2 className="w-6 h-6 text-primary animate-in zoom-in duration-300" />
            ) : (
              <>
                <input
                  type="checkbox"
                  className="peer absolute h-6 w-6 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white transition-all checked:border-primary checked:bg-primary hover:border-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20"
                  onChange={handleJoin}
                  disabled={isLoading}
                  checked={isEnrolled}
                />
                <svg
                  className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-secondary text-lg sm:text-xl tracking-tight truncate">
                {isEnrolled ? "Welcome to the VIP Club!" : "Join our VIP Loyalty Program"}
              </span>
              {!isEnrolled && (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                >
                  <Gift className="w-5 h-5 text-primary drop-shadow-sm" />
                </motion.div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {isEnrolled ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1.5"
                >
                  <p className="text-sm sm:text-base text-primary font-medium leading-relaxed">
                    You're all set! You'll earn points automatically on this and all future orders.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="promo"
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5"
                >
                  <p className="text-sm sm:text-base text-secondary/80 leading-relaxed">
                    Earn points on every order and unlock exclusive rewards, extra discounts, and free items!
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="text-xs font-semibold text-secondary bg-primary/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ring-1 ring-inset ring-primary/20 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 fill-primary/20 text-primary" />
                      <span>Start earning points today!</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </label>
      </div>
    </motion.div>
  );
};
