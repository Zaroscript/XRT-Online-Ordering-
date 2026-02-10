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
        data?.options?.maintenance?.isUnderMaintenance ||
          (data as any)?.maintenance?.isUnderMaintenance,
        data?.options?.maintenance || (data as any)?.maintenance,
      );
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS] });
    },
  });
};

/**
 * Fetches settings from the custom server (GET /settings).
 * No mock or placeholder data - only real data from the database.
 * Requires token; when disabled, settings is undefined.
 */
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
