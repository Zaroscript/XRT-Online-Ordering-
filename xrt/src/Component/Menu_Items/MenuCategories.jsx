import React from "react";
import { COLORS } from "../../config/colors";
import CatCard from "../Categories/CatCard";
import CategorySkeleton from "../Categories/CategorySkeleton";

export default function MenuCategories({ categories = [], onCategoryClick, loading = false }) {
  const styleVars = {
    '--primary': COLORS.primary,
  };

  return (
    <div className="bg-white" style={styleVars}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8 md:gap-x-[30px] md:gap-y-[60px] lg:px-[45px] px-4 py-8 md:py-[60px] place-items-center">
        {loading
          ? [...Array(8)].map((_, i) => <CategorySkeleton key={i} />)
          : categories.map((item, i) => (
              <CatCard 
                key={item._id || i} 
                item={item} 
                index={i} 
                onClick={() => onCategoryClick(item.name)} 
            />
        ))}
      </div>
    </div>
  );
}
