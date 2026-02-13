import { useState } from "react";
import { useSiteSettingsQuery } from "@/api/hooks/useSiteSettings";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import { Menu } from "lucide-react";
import { COLORS } from "../../../config/colors";

const MiddleNav = ({ count, total, link, setclickfun, onCartClick }) => {
  const { logo: settingsLogo } = useSiteSettingsQuery();
  const logoSrc = resolveImageUrl(settingsLogo?.original ?? settingsLogo?.thumbnail ?? "");
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className=" py-[30px] flex header-container"
      style={{ '--primary-hover': COLORS.primaryHover }}
    >
      <Menu
        size={30}
        className="lg:hidden  text-gray-700 hover:text-gray-400 duration-300 cursor-pointer"
        onClick={() => setclickfun()}
      />

      <a href={link} className="relative block w-[120px] md:w-[150px]">
        {!logoSrc && (
           <div className="w-full h-[40px] bg-gray-200 animate-pulse rounded"></div>
        )}
        {logoSrc ? (
          <>
            <img
              src={logoSrc}
              className={`max-w-[100px] transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0 absolute top-0 left-0"
              }`}
              loading="eager"
              alt="system logo"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="w-full h-[40px] bg-gray-200 animate-pulse rounded absolute top-0 left-0"></div>
            )}
          </>
        ) : null}
      </a>
      <div onClick={onCartClick} className="flex cursor-pointer -translate-y-1 group">
        <i className="fa-thin fa-bag-shopping cursor-pointer text-gray-600 mt-[15px] text-[30px] group-hover:text-[var(--primary-hover)] duration-200 "></i>
        <h3 className="translate-y-[32px] translate-x-[-17px] text-white background_shopping_bag w-[18px] h-[18px] text-[11px]  ">
          {count}
        </h3>
        <div className=" items-center flex font-semibold relative translate-y-[6px]">
          <span className="z-10">£{total}</span>
          <span className="block w-0 border-b-2 border-black transition-all duration-300 group-hover:w-full absolute left-0 bottom-[10px]"></span>
        </div>
      </div>
    </div>
  );
};

export default MiddleNav;
