import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdsCard = ({ item }) => {
  const [copied, setCopied] = useState(false);

  // Normalize fields between hardcoded constants and dynamic site settings
  const title = item.title;
  const description = item.offer || item.description;
  const image = item.src || (typeof item.image === "string" ? item.image : item.image?.original);
  const offerColor = item.offer_color || "#E2AA22";
  const couponCode = item.couponCode;
  const showCouponCode = item.showCouponCode;

  // If a coupon code exists, link to menu with the coupon applied
  const link = couponCode ? `/menu?coupon=${couponCode}` : "/menu";

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Link
      to={link}
      className="bg-no-repeat p-8 rounded-[10px] pb-[60px] relative group/card w-full h-[180px] lg:h-[200px] block cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30 group-hover/card:opacity-50 duration-300 rounded-[10px]"></div>
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-[22px] lg:text-[24px] font-bold w-full max-w-[200px] text-white leading-tight drop-shadow-md">
            {title}
          </h2>
          <h5
            className="text-[14px] font-semibold mt-1 drop-shadow-sm"
            style={{ color: offerColor }}
          >
            {description}
          </h5>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          {showCouponCode && couponCode && (
            <div 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit group/copy cursor-pointer transition-all duration-300 relative border-2 ${
                copied 
                ? "bg-(--primary)/20 border-(--primary)/50" 
                : "bg-white/10 hover:bg-white/15 border-dashed border-white/30 hover:border-white/50"
              } backdrop-blur-md`}
            >
              <span className={`text-white text-[13px] font-mono tracking-widest font-black uppercase ${copied ? 'opacity-0' : 'opacity-100'}`}>
                {couponCode}
              </span>
              
              <div className={`flex items-center gap-1.5 transition-all duration-300 ${copied ? 'text-(--primary) brightness-150 scale-110' : 'text-white/70'}`}>
                {!copied && <div className="h-3 w-px bg-white/20 mx-1"></div>}
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  {copied ? "Copied!" : "Copy"}
                </span>
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-[11px]`}></i>
              </div>

              {copied && (
                <span className="absolute left-3 text-white text-[13px] font-mono tracking-widest font-black uppercase animate-pulse">
                  {couponCode}
                </span>
              )}
            </div>
          )}
          <div className="flex text-white text-[14px] font-semibold group/btn relative self-start items-center gap-2">
            <span>Order Now</span>
            <div className="relative overflow-hidden w-4 h-4">
              <i className="fa-solid fa-arrow-right absolute top-0 left-0 transition-transform duration-300 group-hover/btn:translate-x-full"></i>
              <i className="fa-solid fa-arrow-right absolute top-0 -left-full transition-transform duration-300 group-hover/btn:translate-x-full text-white/50"></i>
            </div>
            <span className="block w-0 border-b-2 border-white transition-all duration-300 group-hover/btn:w-full absolute left-0 bottom-[-2px]"></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdsCard;
