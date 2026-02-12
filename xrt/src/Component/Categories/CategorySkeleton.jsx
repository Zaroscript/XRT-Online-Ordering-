import React from "react";

const CategorySkeleton = () => {
  return (
    <div className="flex flex-col items-center animate-pulse">
      {/* Circle Skeleton */}
      <div className="w-[120px] h-[120px] md:w-[130px] md:h-[130px] lg:w-[140px] lg:h-[140px] rounded-full bg-gray-200 mb-3" />
      
      {/* Name Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
      
      {/* Product Count Skeleton */}
      <div className="h-3 bg-gray-100 rounded w-16" />
    </div>
  );
};

export default CategorySkeleton;
