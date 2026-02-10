import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Response shape from GET /public/site-settings
 */
export function getSiteSettings() {
  return apiClient
    .get(API_ENDPOINTS.PUBLIC_SITE_SETTINGS)
    .then((res) => res.data?.data ?? res.data ?? { heroSlides: [] });
}
