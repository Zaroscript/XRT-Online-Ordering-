import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../config/colors';

export default function Items({ item }) {
  const styleVars = {
    '--primary': COLORS.primary,
  };

  const hasStrike =
    item.strikePrice != null &&
    !Number.isNaN(Number(item.strikePrice)) &&
    Number(item.strikePrice) > Number(item.displayAmount ?? 0);

  const inner = (
    <div className="flex flex-col md:flex-row items-center md:items-start" style={styleVars}>
      <img
        src={item.src}
        alt=""
        className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[10px] cursor-pointer object-cover"
      />
      <div className="mt-3 md:mt-0 md:pl-[15px] w-full md:w-[220px] flex flex-col text-center md:text-left">
        <span className="block text-[18px] hover:cursor-pointer hover:text-[var(--primary)] duration-300">
          {item.name}
        </span>
        <div className="">
          {hasStrike && (
            <span className="line-through text-gray-500 text-[15px]">
              ${Number(item.strikePrice).toFixed(2)}
            </span>
          )}
          <span
            className={`text-[var(--primary)] font-semibold text-[18px] ${hasStrike ? 'pl-3' : ''}`}
          >
            {item.offer}
          </span>
        </div>
      </div>
    </div>
  );

  if (item.id) {
    return (
      <Link to={`/product/${item.id}`} className="block no-underline text-inherit">
        {inner}
      </Link>
    );
  }

  return inner;
}
