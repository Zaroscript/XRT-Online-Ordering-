const STORAGE_KEY = "xrt_selected_promotion";

function notifyPromotionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("xrt-promotion-change"));
}

/** @returns {{ id: string, headline?: string, image_url?: string, template?: string, cta_label?: string } | null} */
export function getAppliedPromotion() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAppliedPromotion(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  notifyPromotionChange();
}

export function clearAppliedPromotion() {
  localStorage.removeItem(STORAGE_KEY);
  notifyPromotionChange();
}
