import React from "react";

const AdsCard = ({ item }) => {
  return (
    <div
      className="bg-no-repeat p-8 rounded-[10px]  pb-[60px] relative group/card md:w-[70%] md:h-[100%] xl:w-[88%] xl:h-[100%] "
      style={{ backgroundImage: `url(${item.src})` }}
    >
      <div className="absolute xl:w-[100%] xl:h-[100%] inset-0 bg-black opacity-0 group-hover/card:opacity-50  duration-300 rounded-[10px]"></div>
      <div className="relative z-10">
        <h2 className=" text-[24px] font-[700]  w-[160px] text-white ">
          {item.title}
        </h2>
        <h5
          className="text-gray-400 text-[14px] font-[600] "
          style={{ color: item.offer_color }}
        >
          {item.offer}
        </h5>
        <p className="inline-block mt-[30px] text-white text-[14px] font-[600] group/btn relative cursor-pointer">
          Order Now
          <i className="fa-solid fa-arrow-right ml-1 group-hover/btn:ml-5 duration-300"></i>
          <span className="block w-0 border-b-2 border-white  transition-all duration-300 group-hover/btn:w-full absolute left-0"></span>
        </p>
      </div>
    </div>
  );
};

export default AdsCard;
