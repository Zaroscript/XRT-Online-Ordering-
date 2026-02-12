import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Fetches all active testimonials from the server.
 * @returns {Promise<Array>} Array of testimonial objects { id, name, feedback, image, role, is_active }
 */
export function getActiveTestimonials() {
  return apiClient
    .get(API_ENDPOINTS.TESTIMONIALS_ALL)
    .then((res) => res.data?.data ?? []);
}
