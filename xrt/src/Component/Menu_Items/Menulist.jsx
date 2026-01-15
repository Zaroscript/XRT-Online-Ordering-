import React, { useState, useMemo } from "react";
import { products as defaultProducts } from "../../config/constants";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewMenuList from "./ViewMenus";
import ViewItems from "./ViewItems";
import { COLORS } from "../../config/colors";

export default function Menulist({
  variant = "home", 
  limit = null, 
  initialCategory = "Pizza", 
 
  hideFilter = false, 
  products: customProducts = null, 
  ItemComponent = ViewItems, 
  hideCountText = false,
  categories = [] 
}) {
  const navigate = useNavigate();
  const [active, setActiveState] = useState(initialCategory);

  const styleVars = {
    '--primary': COLORS.primary,
    '--text-primary': COLORS.textPrimary,
    '--text-gray': COLORS.textGray,
  };

  const products = customProducts || defaultProducts;

  const setActive = (category) => {
    setActiveState(category);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.category === active);
  }, [active, products]);

  const displayedProducts = useMemo(() => {
    if (limit !== null && limit > 0) {
      return filteredProducts.slice(0, limit);
    }
    return filteredProducts;
  }, [filteredProducts, limit]);



  const gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const containerPadding = "px-4 md:px-8 lg:px-[70px]";

  const handleViewMore = () => {
    navigate("/menu", { state: { selectedCategory: active } });
  };

  return (
    <div
      style={styleVars}
      className={`${containerPadding} mt-4 ${
        variant === "full" ? "pb-16" : "pb-10"
      }`}
    >
      <div
        className={`flex flex-col gap-4 ${variant === "full" ? "mb-6" : "mb-3"}`}
      >
        <div>
          {variant === "home" && <h2
            className={`${
              variant === "full" ? "text-2xl md:text-3xl" : "text-3xl"
            } font-bold text-[var(--text-primary)] ${variant === "full" ? "mb-2" : "mb-0"}`}
          >
            Menu List
          </h2>}
        </div>
      </div>

      {!hideFilter && (
        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="relative flex-1 min-w-[100px] h-[2px] bg-gray-200 hidden md:block">
            <div className="absolute left-0 top-0 h-full w-16 bg-[var(--primary)]" />
          </div>

          <div className="flex gap-2 md:gap-3 flex-nowrap">
            {categories.map((item, index) => (
              <ViewMenuList
                key={index}
                item={item}
                active={active}
                setActive={setActive}
              />
            ))}
          </div>
        </div>
      )}

      {displayedProducts.length > 0 ? (
        <>
          <div
            className={`w-full grid ${gridCols} gap-4 md:gap-6 ${
              variant === "full" ? "mb-8" : "mt-[30px] pb-10"
            }`}
          >
            {displayedProducts.map((product) => (
              <ItemComponent key={product.id} product={product} />
            ))}
          </div>

          {limit !== null &&
            limit > 0 &&
            filteredProducts.length > limit && (
              <button
                onClick={handleViewMore}
                className="w-[250px] h-[40px] border-2 border-gray-100 rounded-full flex items-center mx-auto justify-center group hover:bg-[var(--primary)] duration-300 cursor-pointer"
              >
                <span className="ml-3 text-[var(--text-gray)] group-hover:text-white duration-300">
                  View More
                </span>
                <ChevronRight
                  strokeWidth={0.8}
                  size={20}
                  className="text-[var(--text-gray)] group-hover:text-white duration-300 translate-y-0.5 group-hover:translate-x-1.5"
                />
              </button>
            )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600">
            For this category.
          </p>
        </div>
      )}
    </div>
  );
}
