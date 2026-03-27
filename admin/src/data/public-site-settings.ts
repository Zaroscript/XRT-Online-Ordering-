import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { publicSiteClient } from './client/public-site';

export function usePublicSiteSettingsQuery(enabled: boolean) {
  return useQuery({
    queryKey: [API_ENDPOINTS.PUBLIC_SITE_SETTINGS],
    queryFn: () => publicSiteClient.getSiteSettings(),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
