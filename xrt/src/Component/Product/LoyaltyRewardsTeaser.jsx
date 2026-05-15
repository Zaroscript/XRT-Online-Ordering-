import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLoyalty } from "@/hooks/useLoyalty";

/**
 * Rewards strip shown above quantity / add-to-cart in product customization flows.
 * Renders whenever the loyalty program is active (from server settings).
 */
export default function LoyaltyRewardsTeaser({ className = "" }) {
  const { isActive, isEnrolled } = useLoyalty();

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 flex items-center justify-between gap-4 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/95 to-white p-4 shadow-sm ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 rounded-lg border border-rose-100 bg-white p-2 shadow-sm">
          <Sparkles size={20} className="text-rose-600" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">
            {isEnrolled ? "Rewards member" : "Join Rewards & Save"}
          </p>
          <p className="text-xs leading-snug text-gray-600">
            {isEnrolled
              ? "Earn points on this item when you complete your order."
              : "Earn points on this item and unlock future discounts!"}
          </p>
        </div>
      </div>
      <div className="shrink-0 rounded-md border border-rose-100 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600 shadow-sm">
        +Points
      </div>
    </motion.div>
  );
}
