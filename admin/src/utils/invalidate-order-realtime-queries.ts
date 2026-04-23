import type { QueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

const ORDER_REALTIME_QUERY_KEYS = [
  API_ENDPOINTS.ANALYTICS,
  API_ENDPOINTS.ORDERS,
  API_ENDPOINTS.POPULAR_PRODUCTS,
  API_ENDPOINTS.LOW_STOCK_PRODUCTS_ANALYTICS,
  API_ENDPOINTS.CATEGORY_WISE_PRODUCTS,
  API_ENDPOINTS.TOP_RATED_PRODUCTS,
  API_ENDPOINTS.NOTIFY_LOGS,
] as const;

export function invalidateOrderRealtimeQueries(queryClient: QueryClient) {
  ORDER_REALTIME_QUERY_KEYS.forEach((queryKey) => {
    void queryClient.invalidateQueries({ queryKey: [queryKey] });
  });
}
