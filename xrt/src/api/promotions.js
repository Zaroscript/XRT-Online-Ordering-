import { apiClient } from "./client";

export async function getPublicPromotions() {
  const res = await apiClient.get("/public/promotions", {
    params: { _t: Date.now() },
  });
  return res.data?.data ?? [];
}

/** @returns {{ promotion: object, preview: { discount: number, delivery_fee_after: number } | null }} */
export async function selectPromotion(promotionId, body = {}) {
  const res = await apiClient.post(
    `/public/promotions/${promotionId}/select`,
    body,
  );
  return res.data?.data;
}
