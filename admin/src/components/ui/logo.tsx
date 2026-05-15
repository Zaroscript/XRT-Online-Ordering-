import Link from '@/components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@/settings/site.settings';
import { useSettings } from '@/contexts/settings.context';
import { pickFirstAttachmentUrl } from '@/utils/branding';
import { useAtom } from 'jotai';
import { miniSidebarInitialValue } from '@/utils/constants';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import { useEffect, useMemo, useState } from 'react';

const DASHBOARD_LOGO_PLACEHOLDER = '/shop-logo-placeholder.svg';

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  const settings = useSettings();
  const [miniSidebar, _] = useAtom(miniSidebarInitialValue);
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Always render the same structure - use CSS/conditional rendering inside to prevent hydration mismatch
  const showCollapsedLogo = isMounted && miniSidebar && width >= RESPONSIVE_WIDTH;

  const fullLogoSrc = useMemo(
    () =>
      pickFirstAttachmentUrl(
        settings?.logo,
        DASHBOARD_LOGO_PLACEHOLDER,
      ) ?? DASHBOARD_LOGO_PLACEHOLDER,
    [settings],
  );

  const collapsedLogoSrc = useMemo(
    () =>
      pickFirstAttachmentUrl(
        settings?.collapseLogo,
        settings?.logo,
        DASHBOARD_LOGO_PLACEHOLDER,
      ) ?? DASHBOARD_LOGO_PLACEHOLDER,
    [settings],
  );
  const logoAltText = settings?.siteTitle ?? siteSettings.logo.alt;

  return (
    <Link
      href={siteSettings?.logo?.href}
      className={cn('inline-flex items-center gap-3', className)}
      {...props}
    >
      {showCollapsedLogo ? (
        <span
          className="relative overflow-hidden "
          style={{
            width: siteSettings.collapseLogo.width,
            height: siteSettings.collapseLogo.height,
          }}
        >
          <img
            src={collapsedLogoSrc}
            alt={logoAltText}
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
            src={fullLogoSrc}
            alt={logoAltText}
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
