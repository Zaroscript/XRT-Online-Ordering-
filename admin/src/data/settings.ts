import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { settingsClient } from './client/settings';
import { useSettings } from '@/contexts/settings.context';
import { Settings } from '@/types';
import {
  getMaintenanceDetails,
  setMaintenanceDetails,
} from '@/utils/maintenance-utils';
import { getAuthCredentials } from '@/utils/auth-utils';

import { useRouter } from 'next/router';

export interface SeoLocaleSettingsPayload {
  locale: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  shareTitle: string;
  shareDescription: string;
  shareImage?: any;
  canonicalUrl: string;
  noindex: boolean;
  score: number;
  customized: boolean;
  updatedAt?: string;
  ogTitle: string;
  ogDescription: string;
  twitterCardType: string;
}

export interface SeoSettingsResponse {
  locale: string;
  seoSettings: SeoLocaleSettingsPayload;
  warnings: string[];
  sources: {
    businessName: string;
    businessDescription: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    websiteUrl: string;
    hoursLabel: string;
    logo?: any;
    favicon?: any;
    heroImage?: any;
    socialLinks: string[];
    menuCategories: string[];
  };
}

export interface SeoHealthResponse {
  locale: string;
  score: number;
  warnings: string[];
}

export const useUpdateSettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateSettings } = useSettings();

  return useMutation({
    mutationFn: (data: any) => settingsClient.update(data),
    onError: (error) => {},
    onSuccess: (data: any) => {
      updateSettings(data?.options || data);
      setMaintenanceDetails(
        Boolean(data?.options?.isUnderMaintenance),
        data?.options?.maintenance ?? (data as any)?.maintenance,
      );
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS] });
    },
  });
};

/** GET /settings; needs token. Disabled => settings undefined. */
export const useSettingsQuery = ({ language }: { language: string }) => {
  const { query } = useRouter();
  const { token } = getAuthCredentials();

  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<Settings, Error>({
    queryKey: [API_ENDPOINTS.SETTINGS, { language }],
    queryFn: () => settingsClient.all({ language }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  return {
    settings: (data ?? null) as Settings | undefined | null,
    error:
      error &&
      (error as any)?.response?.status !== 401 &&
      (error as any)?.response?.status !== 400
        ? error
        : null,
    loading: isLoading,
  };
};

export const useSeoSettingsQuery = (options?: { locale?: string; enabled?: boolean }) => {
  return useQuery<SeoSettingsResponse, Error>({
    queryKey: [API_ENDPOINTS.SETTINGS_SEO, { locale: options?.locale ?? 'en' }],
    queryFn: () => settingsClient.getSeo({ locale: options?.locale ?? 'en' }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useSeoHealthScoreQuery = (options?: { locale?: string; enabled?: boolean }) => {
  return useQuery<SeoHealthResponse, Error>({
    queryKey: [API_ENDPOINTS.SETTINGS_SEO_HEALTH, { locale: options?.locale ?? 'en' }],
    queryFn: () => settingsClient.getSeoHealth({ locale: options?.locale ?? 'en' }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateSeoSettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { locale?: string; seoSettings: Record<string, any> }) =>
      settingsClient.updateSeo(payload),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: () => {
      toast.error('Unable to save SEO settings. Please review your fields and try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS_SEO] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS_SEO_HEALTH] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS] });
    },
  });
};

export const useGenerateSeoSettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { locale?: string; force?: boolean }) =>
      settingsClient.generateSeo(payload),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: () => {
      toast.error('Unable to auto-generate SEO settings right now.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS_SEO] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS_SEO_HEALTH] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS] });
    },
  });
};
