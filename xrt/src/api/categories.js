import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export function getCategories() {
  return apiClient
    .get(API_ENDPOINTS.CATEGORIES)
    .then((res) => (res.data?.success && Array.isArray(res.data?.data) ? res.data.data : []));
}
