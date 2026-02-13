import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export function getActiveTestimonials() {
  return apiClient
    .get(API_ENDPOINTS.TESTIMONIALS_ALL)
    .then((res) => res.data?.data ?? []);
}
