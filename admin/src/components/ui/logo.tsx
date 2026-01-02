import Link from '@/components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@/settings/site.settings';
import { useSettings } from '@/contexts/settings.context';
import { LogoSVG } from '@/components/icons/logo';
import LogoText from '@/components/icons/logo-text';
import { useAtom } from 'jotai';
import { miniSidebarInitialValue } from '@/utils/constants';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import { useRouter } from 'next/router';
import { useSettingsQuery } from '@/data/settings';
import { useEffect, useState } from 'react';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const { locale } = useRouter();
  const { settings } = useSettingsQuery({
    language: locale!,
  });
  const [miniSidebar, _] = useAtom(miniSidebarInitialValue);
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show fallback or loading state during SSR/hydration
  if (!isMounted) {
    return (
      <Link
        href={siteSettings?.logo?.href}
        className={cn('inline-flex items-center gap-3', className)}
      >
        <span
          className="relative overflow-hidden "
          style={{
            width: siteSettings.logo.width,
            height: siteSettings.logo.height,
          }}
        >
          <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={siteSettings?.logo?.href}
      className={cn('inline-flex items-center gap-3', className)}
      // {...props}
    >
      {miniSidebar && width >= RESPONSIVE_WIDTH ? (
        <span
          className="relative overflow-hidden "
          style={{
            width: siteSettings.collapseLogo.width,
            height: siteSettings.collapseLogo.height,
          }}
        >
          <img
            src={
              settings?.options?.collapseLogo?.original ??
              siteSettings.collapseLogo.url
            }
            alt={settings?.options?.siteTitle ?? siteSettings.collapseLogo.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </span>
      ) : (
        <span
          className="relative overflow-hidden "
          style={{
            width: siteSettings.logo.width,
            height: siteSettings.logo.height,
          }}
        >
          <img
            src={settings?.options?.logo?.original ?? siteSettings.logo.url}
            alt={settings?.options?.siteTitle ?? siteSettings.logo.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </span>
      )}
    </Link>
  );
};

export default Logo;
