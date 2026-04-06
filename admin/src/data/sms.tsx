import Router from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import {
  smsCampaignClient,
  SmsCampaignAudiencePayload,
  SmsCampaignPayload,
} from './client/sms-campaigns';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Routes } from '@/config/routes';

/** Fetch paginated SMS campaigns */
export const useSmsQuery = (search?: string, page = 1) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS, { search, page }],
    queryFn: () => smsCampaignClient.paginated({ page, limit: 15, search }),
    placeholderData: (prev: any) => prev,
    select: (res: any) => ({
      data: res?.data ?? [],
      paginatorInfo: {
        total: res?.total ?? 0,
        currentPage: res?.current_page ?? 1,
        lastPage: res?.last_page ?? 1,
        perPage: res?.per_page ?? 15,
        count: (res?.data ?? []).length,
        firstItem: 1,
        lastItem: (res?.data ?? []).length,
      },
    }),
  });
};

/** Get live audience count */
export const useSmsAudienceCountMutation = () => {
  return useMutation({
    mutationFn: (payload: SmsCampaignAudiencePayload) =>
      smsCampaignClient.countAudience(payload),
  });
};

/** Create and send a new SMS campaign */
export const useCreateSmsCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SmsCampaignPayload) => smsCampaignClient.create(data),
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS] });
      Router.push(Routes.sms.list);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG');
      toast.error(message);
    },
  });
};

/** Fetch a single SMS campaign for editing */
export const useSmsCampaignQuery = (id: string) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS, id],
    queryFn: () => smsCampaignClient.get(id),
    enabled: !!id,
  });
};

/** Update and resend an existing SMS campaign */
export const useUpdateSmsCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) => smsCampaignClient.update(id, data),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      Router.push(Routes.sms.list);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:error-something-went-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS] });
    },
  });
};

/** Resend an existing SMS campaign */
export const useResendSmsCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => smsCampaignClient.resend(id),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG');
      toast.error(message);
    },
  });
};

/** Delete an SMS campaign */
export const useDeleteSmsCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => smsCampaignClient.delete(id),
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SMS_CAMPAIGNS] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG');
      toast.error(message);
    },
  });
};
