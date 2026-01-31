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
import { mockSettings } from './mock-data';
import { getAuthCredentials } from '@/utils/auth-utils';

import { useRouter } from 'next/router';

export const useUpdateSettingsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateSettings } = useSettings();

  return useMutation({
    mutationFn: (data: any) => settingsClient.update(data),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data: any) => {
      updateSettings(data?.options || data); // Handle flat response
      setMaintenanceDetails(
        data?.options?.maintenance?.isUnderMaintenance ||
          (data as any)?.maintenance?.isUnderMaintenance,
        data?.options?.maintenance || (data as any)?.maintenance,
      );
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SETTINGS] });
    },
  });
};

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
    enabled: !!token, // Only fetch settings when authenticated
    // Return mock settings if query fails or is disabled
    placeholderData: mockSettings as any,
  });
  const settings = data || (!isLoading && !token ? mockSettings : null);

  return {
    settings: settings as Settings | undefined,
    error:
      error &&
      (error as any)?.response?.status !== 401 &&
      (error as any)?.response?.status !== 400
        ? error
        : null,
    loading: isLoading,
  };
};
