import React from "react";
import CatCard from "./CatCard";
import { useCategoriesQuery } from "@/api";
import CategorySkeleton from "./CategorySkeleton";

export default function Categories({ categories: propCategories }) {
  const { categories: fetchedCategories, loading } = useCategoriesQuery();
  
  const categories = propCategories || fetchedCategories;

  if (loading && !propCategories) {
    return (
      <div className="flex flex-wrap justify-center gap-4 px-2 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-[calc(50%-16px)] md:w-auto flex justify-center">
            <CategorySkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap  gap-x-2 gap-y-8 md:gap-y-16 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 py-[45px] px-2 md:px-[38px] pb-[10px] place-items-center mx-auto">
        {categories.map((item, i) => {
          return (
            <div key={item._id || i} className="w-[calc(50%-10px)] md:w-auto flex justify-center">
              <CatCard item={item} index={i} />
            </div>
          );
        })}
      </div>
    </>
  );
}
