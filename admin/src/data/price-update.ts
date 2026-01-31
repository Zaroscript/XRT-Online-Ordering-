import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';
import { useTranslation } from 'next-i18next';

export enum PriceChangeType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}

export enum PriceValueType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum PriceUpdateTarget {
  ITEMS = 'ITEMS',
  MODIFIERS = 'MODIFIERS',
}

export interface BulkPriceUpdateInput {
  type: PriceChangeType;
  value_type: PriceValueType;
  value: number;
  target: PriceUpdateTarget;
}

export interface PriceChangeHistory {
  id: string;
  admin_id: string;
  type: PriceChangeType;
  value_type: PriceValueType;
  value: number;
  affected_items_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  rolled_back_at?: string;
  rolled_back_by?: string;
  target?: PriceUpdateTarget;
}

export function useBulkPriceUpdateMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkPriceUpdateInput) =>
      HttpClient.post<any>(API_ENDPOINTS.PRICES_BULK_UPDATE, input),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.PRICES_HISTORY],
      });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('common:update-failed');
      toast.error(message);
    },
  });
}

export function useRollbackPriceUpdateMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      HttpClient.post<any>(
        API_ENDPOINTS.PRICES_ROLLBACK.replace(':id', id),
        {},
      ),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.PRICES_HISTORY],
      });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('common:update-failed');
      toast.error(message);
    },
  });
}

export function usePriceUpdateHistoryQuery(
  params: {
    page?: number;
    limit?: number;
  },
  options?: any,
) {
  const { page = 1, limit = 10 } = params;

  return useQuery<{ history: PriceChangeHistory[]; total: number }, Error>({
    queryKey: [API_ENDPOINTS.PRICES_HISTORY, params],
    queryFn: async () => {
      const response = await HttpClient.get<{
        data: { history: PriceChangeHistory[]; total: number };
      }>(API_ENDPOINTS.PRICES_HISTORY, params);
      return response.data;
    },
    ...options,
  });
}

export function useDeletePriceHistoryMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      HttpClient.delete<any>(`${API_ENDPOINTS.PRICES_HISTORY}/${id}`),
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.PRICES_HISTORY],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('common:delete-failed');
      toast.error(message);
    },
  });
}

export function useClearPriceHistoryMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => HttpClient.delete<any>(API_ENDPOINTS.PRICES_HISTORY),
    onSuccess: () => {
      toast.success(t('common:successfully-cleared'));
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.PRICES_HISTORY],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('common:clear-failed');
      toast.error(message);
    },
  });
}
