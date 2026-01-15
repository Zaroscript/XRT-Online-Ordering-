import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Menulist from "../Component/Menu_Items/Menulist";
import MenuItemCard from "../Component/Menu_Items/MenuItemCard";
import MenuCategories from "../Component/Menu_Items/MenuCategories";
import { products } from "../config/constants";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("Marrow");
  const menuListRef = useRef(null);
  const menuProducts = products;
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setActiveCategory(location.state.selectedCategory);
      setTimeout(() => {
        if (menuListRef.current) {
          menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.state]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    if (menuListRef.current) {
      menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuCategories onCategoryClick={handleCategoryClick} />
      
      <div ref={menuListRef} className="scroll-mt-4">
        <Menulist
          key={activeCategory}
          initialCategory={activeCategory}
          variant="full"
          hideFilter={true}
          products={menuProducts}
          ItemComponent={MenuItemCard}
          hideCountText={true}
        />
      </div>
    </div>
  );
}

