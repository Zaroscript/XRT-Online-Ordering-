import React from "react";

/** Single product card skeleton (image, price pill, title, two buttons). */
export default function ProductSkeleton({ compact = false }) {
  const imageHeight = compact ? "h-[160px]" : "h-[320px]";
  return (
    <div className="w-full animate-pulse">
      <div className="relative">
        <div className={`w-full ${imageHeight} bg-gray-200 rounded-[18px]`} />
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-24 h-8 bg-gray-200 rounded-full" />
      </div>
      <div className="mt-8 mb-3 flex justify-center">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-row gap-3 px-4 pb-4 justify-center">
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

/** Grid of product skeletons for loading state. */
export function ProductGridSkeleton({ count = 6, variant = "full" }) {
  const gridCols =
    variant === "home" || variant === "full"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return (
    <div
      className={`w-full grid ${gridCols} gap-4 md:gap-6 ${
        variant === "full" ? "mb-8 px-4 md:px-8 lg:px-[70px]" : "mt-[30px] pb-10 px-4 md:px-8 lg:px-[70px]"
      }`}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={
            variant === "home" || variant === "full"
              ? "w-full max-w-[170px] mx-auto"
              : "w-full"
          }
        >
          <ProductSkeleton compact={variant === "home"} />
        </div>
      ))}
    </div>
  );
}
