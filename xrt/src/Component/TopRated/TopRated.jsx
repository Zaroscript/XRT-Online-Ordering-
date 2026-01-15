import React from "react";
import { coupons, Top_Rated_Items } from "./../../config/constants";
import Items from "./Items";
import { COLORS } from "../../config/colors";

export default function TopRated() {
  const styleVars = {
    '--text-primary': COLORS.textPrimary,
    '--offer-yellow': COLORS.offerYellow,
  };

  return (
    <>
      <div className="flex py-[30px] px-[70px]" style={styleVars}>
        <div
          className="flex justify-start items-center h-[457px] w-[300px] flex-col group/card relative rounded-[10px]"
          style={{ backgroundImage: `url(${coupons.src})` }}
        >
          <div className="bg-black opacity-0 group-hover/card:opacity-40 absolute inset-0 duration-400 rounded-[10px]"></div>
          <span className="text-[30px] font-[700]  text-white mt-[140px]">
            {coupons.ProductName}
          </span>
          <span className="text-[20px] font-[600]  text-white mt-[30px]">
            Enjoy Up to <span className="text-[var(--offer-yellow)]"> {coupons.offer}</span>{" "}
            OFF
          </span>
          <p className="inline-block mt-[30px] text-white text-[14px] font-[600] group/btn relative cursor-pointer">
            Order Now
            <i className="fa-solid fa-arrow-right ml-1 group-hover/btn:translate-x-3  duration-300"></i>
            <span className="block w-0 border-b-2 border-white  transition-all duration-300 group-hover/btn:w-[110%] absolute left-0"></span>
          </p>
        </div>

        <div className="ml-[30px] w-[75%]">
          <h2 className="text-3xl font-[700] text-[var(--text-primary)] mb-3">Top Rated</h2>
          <div className="relative  h-[2px] bg-gray-200">
            <div className="absolute left-0 top-0 h-full w-16 bg-green-600" />
          </div>
          <div className="grid grid-cols-3 gap-4 grid-rows-3 mt-8">
            {
              Top_Rated_Items.map((item, index) => (
                <Items key={index} item={item} />
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
