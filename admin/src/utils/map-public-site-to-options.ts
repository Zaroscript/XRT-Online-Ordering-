import type { PublicSiteSettings } from '@/data/client/public-site';

/**
 * Shapes public GET /public/site-settings into the same "options" object
 * the admin SettingsProvider / DefaultSeo / Logo expect (from authenticated /settings).
 */
export function mapPublicSiteToOptions(publicData: PublicSiteSettings | null | undefined) {
  if (!publicData || typeof publicData !== 'object') return null;

  const logo = publicData.logo ?? null;
  const collapseLogo = publicData.collapseLogo ?? logo;

  const apiSeo = (publicData as any).seo;
  const siteTitle = publicData.siteTitle ?? 'XRT Restaurant System';
  const siteSubtitle = publicData.siteSubtitle ?? '';

  return {
    siteTitle,
    siteSubtitle,
    logo,
    collapseLogo,
    currency: (publicData as any).currency ?? 'USD',
    currencyOptions:
      (publicData as any).currencyOptions ?? {
        formation: 'en-US',
        fractions: 2,
      },
    seo: {
      metaTitle: apiSeo?.metaTitle || siteTitle,
      metaDescription: apiSeo?.metaDescription || siteSubtitle,
      ogTitle: apiSeo?.ogTitle || siteTitle,
      ogDescription: apiSeo?.ogDescription || siteSubtitle,
      ogImage: apiSeo?.ogImage ?? logo,
      twitterHandle: apiSeo?.twitterHandle ?? '',
      twitterCardType: apiSeo?.twitterCardType ?? 'summary_large_image',
      metaTags: apiSeo?.metaTags ?? '',
      canonicalUrl: apiSeo?.canonicalUrl ?? '',
    },
    isUnderMaintenance: Boolean((publicData as any).isUnderMaintenance),
    maintenance: (publicData as any).maintenance ?? null,
  };
}
