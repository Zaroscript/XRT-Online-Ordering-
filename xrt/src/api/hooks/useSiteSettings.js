import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../endpoints";
import { getSiteSettings } from "../siteSettings";

const SITE_SETTINGS_QUERY_KEY = [API_ENDPOINTS.PUBLIC_SITE_SETTINGS];

/**
 * Fetches public site settings (hero slides, site title, logo) from the custom server.
 * Used by the hero/slider and other storefront components.
 */
export function useSiteSettingsQuery(options = {}) {
  const query = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: getSiteSettings,
    staleTime: 0, // Fetch fresh data immediately
    refetchOnWindowFocus: true,
    ...options,
  });

  return {
    ...query,
    heroSlides: query.data?.heroSlides ?? [],
    siteTitle: query.data?.siteTitle ?? "",
    siteSubtitle: query.data?.siteSubtitle ?? "",
    logo: query.data?.logo ?? null,
  };
}
