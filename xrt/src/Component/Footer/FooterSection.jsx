import { COLORS } from "../../config/colors";
import { footer_image } from "../../config/constants";
import Location from "./Location";
import My_Account from './My_Account';
import Categories from "./Categories_Footer";
import Categories_2 from "./Categories_Footer_2";

import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";
import SocialLinks from "./SocialLinks";

export default function FooterSection() {
  const { data: settings } = useSiteSettingsQuery();
  const socials = settings?.contactDetails?.socials;
  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-4 py-12 md:px-8 lg:px-[70px]"
        style={{
          backgroundColor: 'var(--color-footer-bg)',
          color: 'var(--color-footer-text)',
          backgroundImage: `url(${footer_image.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-center md:text-left" style={{ color: 'var(--color-footer-text)' }}>
          {settings?.footer_text && (
             <p className="mb-4 text-2xl font-medium leading-7" style={{ color: COLORS.offerYellow }}>
               {settings?.footer_text}
             </p>
          )}
          <span className="font-bold text-(--color-primary) text-[17px] block mb-2">STORE LOCATION</span>
          <ul className="pt-2">
            <Location />
          </ul>
        </div>
        <div className="text-center md:text-left">
            <span className="font-bold text-(--color-primary) text-[17px] block mb-4">QUICK LINKS</span>
            <ul className="pt-0">
                <My_Account/>
            </ul>
        </div>
        <div className="text-center md:text-left xl:flex xl:flex-col xl:items-center xl:col-span-2">
            <span className="font-bold text-[#FFA900] text-[17px] block mb-4 xl:w-full xl:text-center xl:pr-[40%]">CATEGORIES</span>
          <ul className="pt-0 grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2 xl:gap-x-8 xl:w-full xl:text-left xl:m-0 xl:p-0">
            <Categories/>
          </ul>
        </div>
      </div>
      <div className="brightness-90 flex flex-col gap-4 py-6 md:py-4 px-4 md:px-8 lg:px-[70px] md:flex-row md:flex-wrap md:items-center md:justify-between" style={{ backgroundColor: 'var(--color-footer-bg)' }}>
        <h2 className="text-[16px] text-center md:text-left order-2 md:order-1" style={{ color: 'var(--color-footer-text)' }}>
          {(() => {
            const text = settings?.copyrightText?.replace(/Powered by XRT/i, '').trim() || '';
            const siteLink = settings?.siteLink || '#';
            return (
              <>
                {text} {text && ' '}Powered by{' '}
                <a 
                  href={siteLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold hover:underline"
                  style={{ color: COLORS.offerYellow }}
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
