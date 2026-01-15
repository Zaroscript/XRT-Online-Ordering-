import React from "react";
import { cards_items } from "../../config/constants";
import AdsCard from "./AdsCard";

export default function AdsList() {
  return (
    <div className="px-6 lg:px-12 py-10">
      <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 place-items-center">
        {cards_items.map((item, i) => (
          <AdsCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
