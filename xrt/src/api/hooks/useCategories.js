import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../endpoints";
import { getCategories } from "../categories";

const CATEGORIES_QUERY_KEY = [API_ENDPOINTS.CATEGORIES];

export function useCategoriesQuery(options = {}) {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
    staleTime: 0,
    refetchOnWindowFocus: true,
    ...options,
  });

  return {
    ...query,
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
  };
}
