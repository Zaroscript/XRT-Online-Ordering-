import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export const dashboardClient = {
  analytics(params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'hour' | 'weekday' | 'month' | 'year';
    year?: number;
    years_range?: number | 'all';
  }) {
    return HttpClient.get<any>(API_ENDPOINTS.ANALYTICS, params);
  },
  couponPerformance(range_days: number) {
    return HttpClient.get<any>(API_ENDPOINTS.COUPON_PERFORMANCE_ANALYTICS, { range_days });
  },
};
