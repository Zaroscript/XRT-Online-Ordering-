import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Menulist from "../Component/Menu_Items/Menulist";
import ViewItems from "../Component/Menu_Items/ViewItems";
import MenuCategories from "../Component/Menu_Items/MenuCategories";
import useCategories from "../hooks/useCategories";
import useProducts from "../hooks/useProducts";

export default function Menu() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState("Marrow"); // Default, will be updated when categories load
  const menuListRef = useRef(null);
  const menuProducts = products || [];
  const location = useLocation();

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !location.state?.selectedCategory) {
       setActiveCategory(categories[0].name);
    }
  }, [categories, location.state]);

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setTimeout(() => {
        setActiveCategory(location.state.selectedCategory);
        // Scroll after state update
        if (menuListRef.current) {
          menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    }
  }, [location.state]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    if (menuListRef.current) {
      menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (productsLoading) return null; // We can still block on products for now, or handle that skeleton separately

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuCategories categories={categories} onCategoryClick={handleCategoryClick} loading={categoriesLoading} />
      
      <div ref={menuListRef} className="scroll-mt-4">
        <Menulist
          key={activeCategory}
          initialCategory={activeCategory}
          variant="full"
          hideFilter={true}
          products={menuProducts}
          ItemComponent={ViewItems}
          hideCountText={true}
          // Menulist doesn't need 'categories' prop here because hideFilter={true} hides the tabs. 
          // But if we wanted tabs, we would pass them.
          // Wait, Menu page HAS MenuCategories component above Menulist. 
          // Menulist here is just the list of items.
        />
      </div>
    </div>
  );
}

