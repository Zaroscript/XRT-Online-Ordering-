import React from "react";

const AdsCardSkeleton = () => {
  return (
    <div className="bg-gray-200 p-8 rounded-[10px] pb-[60px] relative w-full h-[200px] md:h-[220px] lg:h-[240px] animate-pulse">
      <div className="relative z-10 space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 rounded w-[160px]"></div>
        {/* Offer skeleton */}
        <div className="h-4 bg-gray-300 rounded w-[80px]"></div>
        {/* Button skeleton */}
        <div className="mt-[30px] h-4 bg-gray-300 rounded w-[100px]"></div>
      </div>
    </div>
  );
};

export default AdsCardSkeleton;
