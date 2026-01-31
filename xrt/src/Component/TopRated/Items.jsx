import React from 'react'
import { COLORS } from '../../config/colors';

export default function Items({item}) {
  const styleVars = {
    '--primary': COLORS.primary,
  };

  return (
    <>
      <div className="flex" style={styleVars}>
          <img
            src={item.src}
            alt=""
            className="w-[100px] h-[100px] rounded-[10px] cursor-pointer"
          />
          <div className="pl-[15px] w-[220px] flex flex-col ">
            <span className="block text-[18px] hover:cursor-pointer hover:text-[var(--primary)] duration-300">
              {item.name}
            </span>
            <div className="">
              <span className="line-through text-gray-500 text-[15px] ">
                {item.basePrice ? `$${item.basePrice.toFixed(2)}` : item.price}
              </span>
              <span className="pl-3 text-[var(--primary)] font-semibold text-[18px]">
                {item.offer}
              </span>
            </div>
          </div>
        </div>
    </>
  )
}
