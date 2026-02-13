import React from "react";
import CatCard from "./CatCard";
import { useCategoriesQuery } from "@/api";
import CategorySkeleton from "./CategorySkeleton";

export default function Categories({ categories: propCategories }) {
  const { categories: fetchedCategories, loading } = useCategoriesQuery();
  
  const categories = propCategories || fetchedCategories;

  if (loading && !propCategories) {
    return (
      <div className="grid xl:grid-cols-8 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 gap-x-[50px] gap-y-[100px] lg:px-[45px] px-[38px] py-[60px] pb-[80px] place-items-center">
        {[...Array(8)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <>
      <div className="grid  xl:grid-cols-8 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 gap-x-[50px] gap-y-[100px] lg:px-[45px] px-[38px] py-[60px] pb-[80px] place-items-center">
        {categories.map((item, i) => {
          return <CatCard key={item._id || i} item={item} index={i} />;
        })}
      </div>
    </>
  );
}
