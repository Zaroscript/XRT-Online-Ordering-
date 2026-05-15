import Router, { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { promotionClient } from './client/promotion';
import {
  Promotion,
  PromotionPaginator,
  PromotionQueryOptions,
} from '@/types';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Config } from '@/config';
import { HttpClient } from './client/http-client';

export const useCreatePromotionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation({
    mutationFn: promotionClient.create,
    onSuccess: async () => {
      const dest = router.query.shop
        ? `/${router.query.shop}${Routes.promotion.list}`
        : Routes.promotion.list;
      await Router.push(dest, undefined, { locale: Config.defaultLanguage });
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROMOTIONS] });
    },
  });
};

export const useDeletePromotionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: promotionClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROMOTIONS] });
    },
  });
};

export const useUpdatePromotionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promotionClient.update,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROMOTIONS] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:something-wrong'));
    },
  });
};

export const useUpdatePromotionsSortOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      HttpClient.post(API_ENDPOINTS.PROMOTIONS_SORT_ORDER, { items }),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROMOTIONS] });
    },
    onError: () => {
      toast.error(t('common:update-failed'));
    },
  });
};

export const usePromotionQuery = ({ id, language }: { id: string; language: string }) => {
  const { data, error, isPending: isLoading } = useQuery<Promotion, Error>({
    queryKey: [API_ENDPOINTS.PROMOTIONS, { id, language }],
    queryFn: () => promotionClient.get({ slug: id, language }),
    enabled: !!id,
  });

  return {
    promotion: data,
    error,
    loading: isLoading,
  };
};

export const usePromotionsQuery = (options: Partial<PromotionQueryOptions>) => {
  const { data, error, isPending: isLoading } = useQuery<PromotionPaginator, Error>({
    queryKey: [API_ENDPOINTS.PROMOTIONS, options],
    queryFn: () => promotionClient.paginated(options),
    placeholderData: (previousData) => previousData,
  });

  const raw = data as PromotionPaginator | undefined;

  return {
    promotions: raw?.data ?? [],
    paginatorInfo: mapPaginatorData(raw),
    websiteActiveCount: raw?.website_active_count ?? 0,
    websiteActiveMax: raw?.website_active_max ?? 4,
    error,
    loading: isLoading,
  };
};
