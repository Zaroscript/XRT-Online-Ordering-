import React from "react";
import { cards_items } from "../../config/constants";
import AdsCard from "./AdsCard";
import AdsCardSkeleton from "./AdsCardSkeleton";

export default function AdsList({ loading }) {
  const items = loading ? [null, null, null] : cards_items;

  return (
    <div className="px-6 lg:px-12 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 place-items-center max-w-[1260px] mx-auto">
        {items.map((item, i) => (
          <div key={i} className="w-[360px] lg:w-[410px] xl:w-[400px]">
             {loading ? <AdsCardSkeleton /> : <AdsCard item={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}
