import { useEffect, useState } from "react";
import { getAppliedPromotion } from "../utils/promotionStorage";

/**
 * Re-reads when promotion is set/cleared (same tab + other tabs).
 */
export function useAppliedPromotion() {
  const [applied, setApplied] = useState(() => getAppliedPromotion());

  useEffect(() => {
    const sync = () => setApplied(getAppliedPromotion());
    window.addEventListener("xrt-promotion-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("xrt-promotion-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return applied;
}
