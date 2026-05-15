import { useSettings } from '@/contexts/settings.context';
import { DefaultSeo as NextDefaultSeo } from 'next-seo';
import { pickFirstAttachmentUrl } from '@/utils/branding';

const DefaultSeo = () => {
  const settings = useSettings();
  const faviconHref =
    pickFirstAttachmentUrl(
      settings?.favicon,
      settings?.logo,
      '/icons/apple-icon-180.png',
    ) ?? '/icons/apple-icon-180.png';

  return (
    <NextDefaultSeo
      title={settings.siteTitle ?? 'XRT Restaurant System'}
      titleTemplate={`%s | ${settings?.seo?.metaTitle ?? 'XRT Restaurant System'}`}
      description={
        settings?.seo?.metaDescription ||
        settings?.siteSubtitle ||
        'Restaurant Management Platform'
      }
      canonical={settings?.seo?.canonicalUrl}
      openGraph={{
        title:
          settings?.seo?.ogTitle ||
          settings?.siteTitle ||
          'XRT Restaurant System',
        description:
          settings?.seo?.ogDescription ||
          settings?.siteSubtitle ||
          'Restaurant Management Platform',
        type: 'website',
        locale: 'en_US',
        site_name: settings?.siteTitle || 'XRT Restaurant System',
        images: [
          {
            url: settings?.seo?.ogImage?.original,
            width: 800,
            height: 600,
            alt: settings?.seo?.ogTitle || 'XRT Restaurant System',
          },
        ],
      }}
      twitter={{
        handle: settings?.seo?.twitterHandle,
        site: settings?.siteTitle || 'XRT Restaurant System',
        cardType: settings?.seo?.twitterCardType,
      }}
      additionalMetaTags={[
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1 maximum-scale=1',
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'theme-color',
          content: '#ffffff',
        },
      ]}
      additionalLinkTags={[
        {
          rel: 'apple-touch-icon',
          href: 'icons/apple-icon-180.png',
        },
        {
          rel: 'icon',
          href: faviconHref,
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
      ]}
    />
  );
};

export default DefaultSeo;
