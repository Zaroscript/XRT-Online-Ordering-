import React from "react";
import { cards_items } from "../../config/constants";
import AdsCard from "./AdsCard";
import AdsCardSkeleton from "./AdsCardSkeleton";
import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";

export default function AdsList() {
  const { offerCards, isLoading } = useSiteSettingsQuery();

  const finalItems = isLoading
    ? [null, null, null]
    : offerCards.length > 0
    ? offerCards
    : cards_items;

  const itemCount = finalItems.length;
  const gridCols = itemCount === 1 
    ? "grid-cols-1" 
    : itemCount === 2 
    ? "grid-cols-1 md:grid-cols-2" 
    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="px-6 lg:px-12 py-10">
      <div className={`grid ${gridCols} gap-10 place-items-center max-w-[1260px] mx-auto`}>
        {finalItems.map((item, i) => (
          <div key={i} className="w-full">
            {isLoading ? <AdsCardSkeleton /> : <AdsCard item={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}
