import React from "react";
import { cards_items } from "../../config/constants";
import AdsCard from "./AdsCard";
import AdsCardSkeleton from "./AdsCardSkeleton";
import { useSiteSettingsQuery } from "../../api/hooks/useSiteSettings";
import { PROMOTIONS_CELL_CLASSES, PROMOTIONS_ROW_CLASSES } from "./promotionsRowLayout";

const MAX_AD_CARDS = 4;

export default function AdsList() {
  const { offerCards, isLoading } = useSiteSettingsQuery();

  const source =
    offerCards.length > 0 ? offerCards : cards_items;

  const finalItems = isLoading
    ? Array.from({ length: MAX_AD_CARDS }, () => null)
    : source.slice(0, MAX_AD_CARDS);

  return (
    <div className="px-6 lg:px-12 py-10">
      <div className={PROMOTIONS_ROW_CLASSES}>
        {finalItems.map((item, i) => (
          <div key={i} className={PROMOTIONS_CELL_CLASSES}>
            {isLoading ? <AdsCardSkeleton /> : <AdsCard item={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}
