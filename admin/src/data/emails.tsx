import Router from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import {
  emailCampaignClient,
  EmailCampaignAudiencePayload,
  EmailCampaignPayload,
} from './client/email-campaigns';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Routes } from '@/config/routes';

/** Fetch paginated email campaigns */
export const useMarketingEmailsQuery = (search?: string, page = 1) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS, { search, page }],
    queryFn: () => emailCampaignClient.paginated({ page, limit: 15, search }),
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
export const useEmailAudienceCountMutation = () => {
  return useMutation({
    mutationFn: (payload: EmailCampaignAudiencePayload) =>
      emailCampaignClient.countAudience(payload),
  });
};

/** Create and send a new email campaign */
export const useCreateEmailCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmailCampaignPayload) => emailCampaignClient.create(data),
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS] });
      Router.push(Routes.emails.list);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:error-something-went-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS] });
    },
  });
};

/** Fetch a single campaign for editing */
export const useEmailCampaignQuery = (id: string) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS, id],
    queryFn: () => emailCampaignClient.get(id),
    enabled: !!id,
  });
};

/** Update and resend an existing email campaign */
export const useUpdateEmailCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) => emailCampaignClient.update(id, data),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      Router.push(Routes.emails.list);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:error-something-went-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS] });
    },
  });
};

/** Resend an existing email campaign */
export const useResendEmailCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailCampaignClient.resend(id),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG');
      toast.error(message);
    },
  });
};

/** Delete an email campaign */
export const useDeleteEmailCampaignMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailCampaignClient.delete(id),
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.EMAIL_CAMPAIGNS] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || t('common:PICKBAZAR_ERROR.SOMETHING_WENT_WRONG');
      toast.error(message);
    },
  });
};
