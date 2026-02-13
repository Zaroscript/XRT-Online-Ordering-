import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../endpoints";
import { getActiveTestimonials } from "../testimonials";

const TESTIMONIALS_QUERY_KEY = [API_ENDPOINTS.TESTIMONIALS_ALL];

/**
 * Fetches active testimonials from the server via React Query.
 * Returns { testimonials, isLoading, isError } and all standard useQuery fields.
 */
export function useTestimonialsQuery(options = {}) {
  const query = useQuery({
    queryKey: TESTIMONIALS_QUERY_KEY,
    queryFn: getActiveTestimonials,
    staleTime: 0,
    ...options,
  });

  return {
    ...query,
    testimonials: query.data ?? [],
  };
}
