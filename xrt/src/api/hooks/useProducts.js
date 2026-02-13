import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../endpoints";
import { getProducts } from "../products";

const PRODUCTS_QUERY_KEY = [API_ENDPOINTS.PRODUCTS];

export function useProductsQuery(options = {}) {
  const query = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
    staleTime: 0,
    refetchOnWindowFocus: true,
    ...options,
  });

  return {
    ...query,
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
  };
}
