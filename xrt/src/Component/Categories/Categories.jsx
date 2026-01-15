import React from "react";
import { Categories_items } from "../../config/constants";
import CatCard from "./CatCard";

export default function Categories() {
  return (
    <>
      <div className="grid  xl:grid-cols-8 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 gap-x-[30px] gap-y-[100px] lg:px-[45px] px-[38px] py-[60px] pb-[80px] place-items-center">
        {Categories_items.map((item, i) => {
          return <CatCard key={i} item={item} />;
        })}
      </div>
    </>
  );
}
