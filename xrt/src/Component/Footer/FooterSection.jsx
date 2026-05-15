import { COLORS } from "../../config/colors";
import { footer_image } from "../../config/constants";
import Location from "./Location";
import My_Account from './My_Account';
import Categories from "./Categories_Footer";
import Categories_2 from "./Categories_Footer_2";

import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import SocialLinks from "./SocialLinks";

export default function FooterSection() {
  const { data: settings } = useSiteSettingsQuery();
  const socials = settings?.contactDetails?.socials;
  const logoSrc = resolveImageUrl(settings?.logo?.original ?? settings?.logo?.thumbnail ?? "");
  
  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-4 py-16 md:px-8 lg:px-[70px]"
        style={{
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-footer-text)',
        }}
      >
        <div className="text-center md:text-left flex flex-col gap-4" style={{ color: 'var(--color-footer-text)' }}>
          {logoSrc && (
            <div className="mb-4 flex justify-center md:justify-start">
              <img src={logoSrc} alt="Website Logo" className="max-w-[120px] object-contain" />
            </div>
          )}
          <h3 className="font-bold text-[18px] uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>About Us</h3>
          {settings?.footer_text && (
             <p className="text-[15px] leading-relaxed opacity-90 text-white">
               {settings?.footer_text}
             </p>
          )}
        </div>
        <div className="text-center md:text-left">
            <h3 className="font-bold text-[18px] uppercase tracking-wider mb-6" style={{ color: 'var(--color-primary)' }}>Quick Links</h3>
            <ul className="flex flex-col gap-3">
                <My_Account/>
            </ul>
        </div>
        <div className="text-center md:text-left">
            <h3 className="font-bold text-[18px] uppercase tracking-wider mb-6" style={{ color: 'var(--color-primary)' }}>Categories</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Categories/>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h3 className="font-bold text-[18px] uppercase tracking-wider mb-6" style={{ color: 'var(--color-primary)' }}>Contact Us</h3>
          <ul className="flex flex-col gap-4">
            <Location />
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 py-6 md:py-4 px-4 md:px-8 lg:px-[70px] md:flex-row md:flex-wrap md:items-center md:justify-between border-t border-white/10" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <h2 className="text-[16px] text-center md:text-left order-2 md:order-1" style={{ color: 'var(--color-footer-text)' }}>
          {(() => {
            const text = settings?.copyrightText?.replace(/Powered by XRT/i, '').trim() || '';
            const siteLink = 'https://xrttech.com';
            return (
              <>
                {text} {text && ' '}Powered by{' '}
                <a 
                  href={siteLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold hover:underline"
                  style={{ color: 'var(--color-primary)'}}
                >
                  XRT
                </a>
              </>
            );
          })()}
        </h2>
        {socials?.length ? (
          <div className="order-1 flex w-full justify-center md:order-2 md:w-auto md:flex-1 md:justify-center">
            <SocialLinks socials={socials} />
          </div>
        ) : null}
        <img src={footer_image.pay} alt="" className="order-3 max-w-[200px] md:max-w-none mx-auto md:mx-0" />
      </div>
    </>
  );
}
