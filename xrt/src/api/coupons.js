import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const verifyCoupon = async (code) => {
  const { data } = await apiClient.post(API_ENDPOINTS.COUPONS_VERIFY, { code });
  return data.data; // The backend returns { success: true, message: '...', data: { ... } }
};
