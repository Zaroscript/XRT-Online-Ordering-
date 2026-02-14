import { COLORS } from "../../config/colors";
import { footer_image } from "../../config/constants";
import Location from "./Location";
import My_Account from './My_Account';
import Categories from "./Categories_Footer";
import Categories_2 from "./Categories_Footer_2";

import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";

export default function FooterSection() {
  const { data: settings } = useSiteSettingsQuery();
  return (
    <>
      <div
        className="bg-[#3D6642] grid grid-cols-4 gap-4 px-[70px] py-[70px]  gap-x-[90px]"
        style={{
          backgroundImage: `url(${footer_image.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-[#E1E1E1]">
          {settings?.footer_text && (
             <p className="mb-4 text-2xl font-medium leading-7" style={{ color: COLORS.offerYellow }}>
               {settings?.footer_text}
             </p>
          )}
          <span className="font-bold text-[#FFA900] text-[17px] hidden">STORE LOCATION</span>
          <ul className="pt-2">
            <Location />
          </ul>
        </div>
        <div className="">
            <span className="font-bold text-[#FFA900] text-[17px] hidden">MY ACCOUNT</span>
            <ul className="pt-4">
                <My_Account/>
            </ul>
        </div>
        <div>
            <span className="font-bold text-[#FFA900] text-[17px] hidden">INFORMATION</span>
          <ul className="pt-4">
            <Categories/>
          </ul>
        </div>
        <div className="">
            <span className="font-bold text-[#FFA900] text-[17px] hidden">CATEGORIES</span>
            <ul className="pt-4">
                <Categories_2/>
            </ul>
        </div>
      </div>
      <div className="bg-[#315234] flex justify-between items-center h-[60px] px-[70px]">
        <h2 className="text-[#E1E1E1] text-[16px]">
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
        <img src={footer_image.pay} alt="" />
      </div>
    </>
  );
}
