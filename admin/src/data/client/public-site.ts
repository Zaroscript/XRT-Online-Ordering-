import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from './api-endpoints';

export type PublicSiteSettings = {
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: { original?: string; thumbnail?: string; id?: string } | null;
  collapseLogo?: { original?: string; thumbnail?: string; id?: string } | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: { original?: string; thumbnail?: string; id?: string } | null;
    twitterHandle?: string;
    twitterCardType?: string;
    metaTags?: string;
    canonicalUrl?: string;
  };
  isUnderMaintenance?: boolean;
  maintenance?: Record<string, unknown> | null;
  contactDetails?: { socials?: Array<{ icon?: string; url?: string }> };
  [key: string]: unknown;
};

/** HttpClient.get returns API body: { success, message, data } */
function unwrap(response: any): PublicSiteSettings {
  if (response?.data !== undefined) return response.data as PublicSiteSettings;
  return response as PublicSiteSettings;
}

export const publicSiteClient = {
  getSiteSettings(): Promise<PublicSiteSettings> {
    return HttpClient.get(API_ENDPOINTS.PUBLIC_SITE_SETTINGS).then(unwrap);
  },
};
