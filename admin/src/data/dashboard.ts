import { Product, ProductQueryOptions, CategoryProductCount } from '@/types';
import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { dashboardClient } from '@/data/client/dashboard';
import { productClient } from '@/data/client/product';
import { 
  mockTopRatedProducts, 
  mockProductCountByCategory, 
  mockDashboardStats 
} from './mock-data';

export function useAnalyticsQuery() {
  return useQuery(
    [API_ENDPOINTS.ANALYTICS], 
    () => Promise.resolve(mockDashboardStats),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
}

export function usePopularProductsQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>(
    [API_ENDPOINTS.POPULAR_PRODUCTS, options],
    () => Promise.resolve(mockTopRatedProducts),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
}

export function useLowProductStockQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>(
    [API_ENDPOINTS.LOW_STOCK_PRODUCTS_ANALYTICS, options],
    () => Promise.resolve([]),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
}

export function useProductByCategoryQuery({
  limit,
  language,
}: {
  limit?: number;
  language?: string;
}) {
  return useQuery<CategoryProductCount[], Error>(
    [API_ENDPOINTS.CATEGORY_WISE_PRODUCTS, { limit, language }],
    () => Promise.resolve(mockProductCountByCategory),
    {
      keepPreviousData: false,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  );
}

export function useMostSoldProductByCategoryQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>(
    [API_ENDPOINTS.CATEGORY_WISE_PRODUCTS_SALE, options],
    () => Promise.resolve([]),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
}

export function useTopRatedProductsQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>(
    [API_ENDPOINTS.TOP_RATED_PRODUCTS, options],
    () => Promise.resolve(mockTopRatedProducts),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
}
