import { Product, ProductQueryOptions, CategoryProductCount } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { dashboardClient } from '@/data/client/dashboard';
import { productClient } from '@/data/client/product';
import {
  mockTopRatedProducts,
  mockProductCountByCategory,
} from './mock-data';

export interface DashboardStatusStat {
  status: string;
  count: number;
  total: number;
}

export interface DashboardSaleHistoryItem {
  label: string;
  tooltipLabel?: string;
  items: number;
  tax: number;
  tips: number;
  total?: number;
}

export interface DashboardSaleByMonth {
  month: string;
  total: number;
}

export interface DashboardSummaryStats {
  totalRevenue: number;
  totalTips: number;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  pickupOrders: number;
  deliveryOrders: number;
  totalDiscounts: number;
  couponUsage: number;
  aov: number;
}

export interface DashboardCouponUsageDetail {
  code: string;
  description?: string;
  type: 'fixed' | 'percentage' | 'free_shipping' | string;
  amount: number;
  activeFrom: string;
  expireAt: string;
  minimumCartAmount: number;
  maxConversions: number | null;
  isApproved: boolean;
  usageCount: number;
  uniqueCustomers: number;
  totalDiscount: number;
}

export type CouponPerformanceStatus = 'active' | 'expiring' | 'paused';

export interface CouponPerformanceTrendPoint {
  label: string;
  revenue: number;
  discount: number;
  previousRevenue: number;
  previousDiscount: number;
}

export interface CouponPerformanceRow {
  couponName: string;
  type: string;
  uses: number;
  revenue: number;
  discountCost: number;
  netProfit: number;
  newCustomers: number;
  roi: number;
  status: CouponPerformanceStatus;
}

export interface CouponPerformanceAlert {
  tone: 'green' | 'red' | 'yellow';
  text: string;
}

export interface CouponPerformanceAnalyticsData {
  rangeDays: 1 | 7 | 30 | 365;
  summary: {
    couponRevenueGenerated: number;
    netRevenueAfterDiscounts: number;
    newCustomersViaCoupons: number;
    aovWithCoupon: number;
    aovWithoutCoupon: number;
    couponOrdersCompleted: number;
    withoutCouponOrdersCompleted: number;
    totalDiscountCost: number;
    previous: {
      couponRevenueGenerated: number;
      netRevenueAfterDiscounts: number;
      newCustomersViaCoupons: number;
      aovWithCoupon: number;
      aovWithoutCoupon: number;
      couponOrdersCompleted: number;
      withoutCouponOrdersCompleted: number;
      totalDiscountCost: number;
    };
  };
  trend: CouponPerformanceTrendPoint[];
  funnel: {
    viewed: number;
    applied: number;
    completed: number;
  };
  topCoupons: Array<{
    couponName: string;
    uses: number;
    revenue: number;
  }>;
  table: CouponPerformanceRow[];
  alerts: CouponPerformanceAlert[];
}

export interface DashboardAnalyticsData {
  totalShops: number;
  totalRevenue: number;
  todaysRevenue: number;
  totalRefunds: number;
  totalYearSaleByMonth: any[];
  todayStats: DashboardSummaryStats;
  weeklyStats: DashboardSummaryStats;
  monthlyStats: DashboardSummaryStats;
  yearlyStats: DashboardSummaryStats;
  allTimeStats: DashboardSummaryStats;
  todayTotalOrderByStatus: DashboardStatusStat[];
  weeklyTotalOrderByStatus: DashboardStatusStat[];
  monthlyTotalOrderByStatus: DashboardStatusStat[];
  yearlyTotalOrderByStatus: DashboardStatusStat[];
  salesHistory: {
    today: DashboardSaleHistoryItem[];
    weekly: DashboardSaleHistoryItem[];
    monthly: DashboardSaleHistoryItem[];
    yearly: DashboardSaleHistoryItem[];
    custom?: DashboardSaleHistoryItem[];
  };
  activeCouponDetails: {
    today: DashboardCouponUsageDetail[];
    weekly: DashboardCouponUsageDetail[];
    monthly: DashboardCouponUsageDetail[];
    yearly: DashboardCouponUsageDetail[];
  };
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  message: string;
  data?: Partial<DashboardAnalyticsData>;
}

export interface CouponPerformanceAnalyticsResponse {
  success: boolean;
  message: string;
  data?: CouponPerformanceAnalyticsData;
}

export const EMPTY_DASHBOARD_SUMMARY_STATS: DashboardSummaryStats = {
  totalRevenue: 0,
  totalTips: 0,
  totalOrders: 0,
  completedOrders: 0,
  canceledOrders: 0,
  pickupOrders: 0,
  deliveryOrders: 0,
  totalDiscounts: 0,
  couponUsage: 0,
  aov: 0,
};

function normalizeDashboardSummaryStats(
  stats?: Partial<DashboardSummaryStats>,
): DashboardSummaryStats {
  return {
    totalRevenue: stats?.totalRevenue ?? 0,
    totalTips: stats?.totalTips ?? 0,
    totalOrders: stats?.totalOrders ?? 0,
    completedOrders: stats?.completedOrders ?? 0,
    canceledOrders: stats?.canceledOrders ?? 0,
    pickupOrders: stats?.pickupOrders ?? 0,
    deliveryOrders: stats?.deliveryOrders ?? 0,
    totalDiscounts: stats?.totalDiscounts ?? 0,
    couponUsage: stats?.couponUsage ?? 0,
    aov: stats?.aov ?? 0,
  };
}

export function getDashboardSummaryStats(
  analyticsData?: Partial<DashboardAnalyticsData>,
  timeFrame: number = 1,
): DashboardSummaryStats {
  switch (timeFrame) {
    case 1:
      return normalizeDashboardSummaryStats(analyticsData?.todayStats);
    case 7:
      return normalizeDashboardSummaryStats(analyticsData?.weeklyStats);
    case 30:
      return normalizeDashboardSummaryStats(analyticsData?.monthlyStats);
    case 365:
      return normalizeDashboardSummaryStats(analyticsData?.yearlyStats);
    default:
      return normalizeDashboardSummaryStats();
  }
}

export function useAnalyticsQuery(options?: {
  start_date?: string;
  end_date?: string;
  granularity?: 'hour' | 'weekday' | 'month' | 'year';
  year?: number;
  years_range?: number | 'all';
  enabled?: boolean;
}) {
  return useQuery<DashboardAnalyticsResponse, Error>({
    queryKey: [
      API_ENDPOINTS.ANALYTICS,
      {
        start_date: options?.start_date,
        end_date: options?.end_date,
        granularity: options?.granularity,
        year: options?.year,
        years_range: options?.years_range,
      },
    ],
    queryFn: () =>
      dashboardClient.analytics({
        start_date: options?.start_date,
        end_date: options?.end_date,
        granularity: options?.granularity,
        year: options?.year,
        years_range: options?.years_range,
      }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: options?.enabled ?? true,
  });
}

export function useCouponPerformanceAnalyticsQuery(options: {
  rangeDays: 1 | 7 | 30 | 365;
  enabled?: boolean;
}) {
  return useQuery<CouponPerformanceAnalyticsResponse, Error>({
    queryKey: [API_ENDPOINTS.COUPON_PERFORMANCE_ANALYTICS, options.rangeDays],
    queryFn: () => dashboardClient.couponPerformance(options.rangeDays),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    enabled: options.enabled ?? true,
  });
}

export function usePopularProductsQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.POPULAR_PRODUCTS, options],
    queryFn: () => productClient.popular(options),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useLowProductStockQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.LOW_STOCK_PRODUCTS_ANALYTICS, options],
    queryFn: () => Promise.resolve([]),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}



export function useMostSoldProductByCategoryQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.CATEGORY_WISE_PRODUCTS_SALE, options],
    queryFn: () => Promise.resolve([]),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useTopRatedProductsQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.TOP_RATED_PRODUCTS, options],
    queryFn: () => productClient.topRated(options),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
