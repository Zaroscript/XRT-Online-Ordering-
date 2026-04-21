import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  itemSizeClient,
  ItemSize,
  CreateItemSizeInput,
  UpdateItemSizeInput,
} from './client/item-size';
import { HttpClient } from './client/http-client';

export const useItemSizesQuery = (
  businessId?: string,
  options?: { enabled?: boolean },
) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ItemSize[]>({
    queryKey: ['item-sizes', businessId],
    queryFn: () => itemSizeClient.getAll(businessId),
    enabled: options?.enabled !== false,
  });
  const sizes = (data as any)?.data || data || [];
  return {
    sizes: Array.isArray(sizes) ? sizes : [],
    error,
    isLoading,
  };
};

export const useItemSizeQuery = (id: string) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ItemSize>({
    queryKey: ['item-size', id],
    queryFn: async () => {
      const response = await itemSizeClient.get(id);
      return (response as any)?.data || response;
    },
    enabled: !!id,
  });
  const size = data;
  return {
    size,
    error,
    isLoading,
  };
};

export const useCreateItemSizeMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (input: CreateItemSizeInput) => itemSizeClient.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes'] });
      // Might need to invalidate items if they stash size/price combos that rely on this? Unlikely for simple create.
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useUpdateItemSizeMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateItemSizeInput) =>
      itemSizeClient.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes'] });
      queryClient.invalidateQueries({ queryKey: ['item-size', variables.id] });
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useUpdateItemSizesSortOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      HttpClient.post(API_ENDPOINTS.ITEM_SIZES_SORT_ORDER, { items }),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: ['item-sizes'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useDeleteItemSizeMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => itemSizeClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes'] });
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:delete-failed'));
    },
  });
};
