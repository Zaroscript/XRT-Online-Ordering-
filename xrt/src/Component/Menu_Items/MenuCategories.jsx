import React from "react";
import { Categories_items } from "../../config/constants";
import { Pizza, Cookie, Carrot, Apple, Drumstick, Utensils } from "lucide-react";
import { COLORS } from "../../config/colors";

export default function MenuCategories({ onCategoryClick }) {
  const styleVars = {
    '--primary': COLORS.primary,
  };

  const getCategoryIcon = (name) => {
    switch (name) {
      case "Marrow": return <Drumstick className="w-6 h-6 text-[var(--primary)]" />;
      case "Fruits": return <Apple className="w-6 h-6 text-[var(--primary)]" />;
      case "leafy Green": return <Carrot className="w-6 h-6 text-[var(--primary)]" />;
      case "Cookies": return <Cookie className="w-6 h-6 text-[var(--primary)]" />;
      case "Vegan Cuisine": return <Pizza className="w-6 h-6 text-[var(--primary)]" />;
      default: return <Utensils className="w-6 h-6 text-[var(--primary)]" />;
    }
  };

  return (
    <div className="bg-white" style={styleVars}>
      <div className="grid grid-cols-3 xl:grid-cols-8 lg:grid-cols-6 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-[30px] md:gap-y-[100px] lg:px-[45px] px-4 py-8 md:py-[60px] md:pb-[80px] place-items-center">
        {Categories_items.map((item, i) => (
          <div
            key={i}
            onClick={() => onCategoryClick(item.name)}
            className="cursor-pointer transition-transform hover:scale-105 w-full flex justify-center"
          >
            <div
              className="hidden md:block p-4 rounded-full lg:h-[130px] lg:w-[130px] md:w-[140px] md:h-[140px] w-[200px] h-[200px]"
              style={{ backgroundColor: item.bg }}
            >
              <img
                src={item.src}
                alt={item.name}
                className="mt-[30px] scale-[1.18] hover:scale-[1.40] duration-300 mx-auto"
              />
              <h2 className="mt-4 text-center font-semibold text-[15px]">
                {item.name}
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 md:hidden">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                {getCategoryIcon(item.name)}
              </div>
              <span className="text-xs text-center font-medium text-gray-700 leading-tight">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
