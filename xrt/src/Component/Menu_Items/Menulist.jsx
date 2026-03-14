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
  // eslint-disable-next-line no-unused-vars
  ItemComponent = ViewItems, 
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



  const gridCols = "grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

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
            } font-bold  text-[var(--text-primary)] text-center md:text-left`}
          >
            Menu List
          </h2>}
        </div>
      </div>

      {!hideFilter && (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 pb-2">
          <div className="relative flex-1 min-w-[100px] h-[2px] bg-gray-200 hidden md:block">
            <div className="absolute left-0 top-0 h-full w-16 bg-[var(--primary)]" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full md:w-auto px-4 md:px-0 mx-auto max-w-[400px] md:max-w-none">
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
            className={`w-full grid ${gridCols} gap-3 md:gap-4 lg:gap-[18px] ${
              variant === "full" ? "mb-8" : "mt-[30px] pb-10"
            }`}
          >
            {displayedProducts.map((product) => (
              (variant === 'home' || variant === 'full') ? (
                <div 
                  key={product.id}
                  className="w-full h-full max-w-[320px] md:max-w-none mx-auto [&>div>div:first-child>img]:!h-[130px] [&>div>div:first-child>img]:!object-scale-down [&>div>div:first-child>img]:!p-2 [&>div>div:last-child]:!flex-col [&>div>div:last-child]:!gap-3 [&>div>div:last-child>div]:!w-full [&>div>div:last-child>div]:!h-auto [&>div>div:last-child>div]:!py-2 [&>div>div:last-child>div_h5]:!text-xs [&>div>div:last-child>div_svg]:!w-4"
                >
                  <ItemComponent product={product} />
                </div>
              ) : (
                <ItemComponent key={product.id} product={product} />
              )
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
