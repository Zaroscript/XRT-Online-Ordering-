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

  const d = query.data;

  return {
    ...query,
    heroSlides: d?.heroSlides ?? [],
    siteTitle: d?.siteTitle ?? "",
    siteSubtitle: d?.siteSubtitle ?? "",
    termsPage: d?.termsPage ?? { title: "", body: "" },
    logo: d?.logo ?? null,
    operating_hours: d?.operating_hours ?? null,
    seo: d?.seo ?? null,
    isUnderMaintenance: Boolean(d?.isUnderMaintenance),
    maintenance: d?.maintenance ?? null,
    contactDetails: d?.contactDetails ?? null,
    showMenuSection: d?.showMenuSection !== false, // default true when settings not yet loaded
    offerCards: d?.offerCards ?? [],
  };
}
