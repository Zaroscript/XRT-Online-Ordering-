import React, { useState } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Ticket, Sparkles, XCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const LoyaltyPointsWidget = ({ phone, subtotal, onDiscountApplied }) => {
  const { 
    isEnrolled, 
    pointsBalance, 
    redeem, 
    resetDiscount, 
    discountValue, 
    isLoading, 
    isActive,
    redeemRate,
    minPointsToRedeem,
  } = useLoyalty();
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redeemError, setRedeemError] = useState(null);

  const parsedPoints = parseInt(pointsToRedeem, 10);
  const hasValidPointValue = Number.isFinite(parsedPoints) && parsedPoints > 0;
  const belowMinimum = hasValidPointValue && minPointsToRedeem > 0 && parsedPoints < minPointsToRedeem;
  const exceedsBalance = hasValidPointValue && parsedPoints > pointsBalance;
  const applyDisabled =
    isLoading ||
    !phone?.trim() ||
    !pointsToRedeem ||
    !hasValidPointValue ||
    belowMinimum ||
    exceedsBalance;

  if (!isActive || !isEnrolled) return null;

  // Show a premium loading state if we are enrolled but haven't fetched the balance yet (initial load)
  if (isLoading && pointsBalance === 0 && !discountValue) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-6 rounded-2xl border border-primary/10 bg-white/50 animate-pulse"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-100 rounded-xl flex-1" />
          <div className="h-10 bg-gray-200 rounded-xl w-24" />
        </div>
      </motion.div>
    );
  }

  const handleApply = async () => {
    if (!hasValidPointValue) return;
    if (belowMinimum) {
      setRedeemError(`Minimum redemption is ${minPointsToRedeem} points.`);
      return;
    }
    if (exceedsBalance) return;
    
    setRedeemError(null);
    const result = await redeem(phone, parsedPoints, subtotal);
    if (result === true) {
        onDiscountApplied?.();
        setPointsToRedeem('');
    } else if (typeof result === 'string') {
        setRedeemError(result);
    }
  };

  const handleRemove = () => {
    resetDiscount();
    setRedeemError(null);
    onDiscountApplied?.();
  };

  const potentialDiscount = (pointsBalance * redeemRate).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-sm"
    >
      <AnimatePresence mode="wait">
        {discountValue > 0 ? (
          <motion.div 
            key="applied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-linear-to-br from-primary/5 to-transparent border-l-4 border-primary"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">Loyalty Discount Applied</h4>
                  <p className="text-sm text-primary font-medium">
                    You are saving ${discountValue.toFixed(2)} on this order!
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
              >
                <XCircle size={16} />
                <span>Remove</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-secondary leading-none mb-1">Your Rewards</h4>
                <p className="text-xs text-gray-500">
                  You have <span className="font-bold text-primary">{pointsBalance}</span> points available 
                  <span className="mx-1.5 opacity-50">•</span> 
                  Est. Value: <span className="font-semibold text-gray-700">${potentialDiscount}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Points to redeem"
                  className="w-full pl-11 pr-4 py-3 bg-linear-to-br from-(--primary)/5 to-transparent border-l-4 border-(--primary) rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all disabled:opacity-50"
                  value={pointsToRedeem}
                  onChange={(e) => {
                    setPointsToRedeem(e.target.value);
                    if (redeemError) setRedeemError(null);
                  }}
                  max={pointsBalance}
                  min={Math.max(minPointsToRedeem || 0, 0)}
                  step={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleApply}
                disabled={applyDisabled}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-sm shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Apply
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-primary opacity-80">
              <Sparkles size={12} className="fill-primary/20" />
              <span>Redeem points for instant savings!</span>
            </div>
            {minPointsToRedeem > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Minimum redemption: {minPointsToRedeem} points.
              </p>
            )}

            <AnimatePresence>
              {redeemError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl overflow-hidden"
                >
                  <p className="text-sm font-medium text-red-700">{redeemError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
