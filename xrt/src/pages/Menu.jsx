import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Menulist from "../Component/Menu_Items/Menulist";
import ViewItems from "../Component/Menu_Items/ViewItems";
import MenuCategories from "../Component/Menu_Items/MenuCategories";
import { ProductGridSkeleton } from "../Component/Menu_Items/ProductSkeleton";
import { useCategoriesQuery, useProductsQuery } from "@/api";

export default function Menu() {
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  const { products, loading: productsLoading } = useProductsQuery();
  const [activeCategory, setActiveCategory] = useState("Marrow"); // Default, will be updated when categories load
  const menuListRef = useRef(null);
  const menuProducts = products || [];
  const location = useLocation();

  // Set initial active category when categories are loaded
  useEffect(() => {
    const categoryParam = new URLSearchParams(location.search).get("category");
    const selected = categoryParam || location.state?.selectedCategory;
    if (categories.length > 0 && !selected) {
       setActiveCategory(categories[0].name);
    }
  }, [categories, location.state, location.search]);

  useEffect(() => {
    const categoryParam = new URLSearchParams(location.search).get("category");
    const selected = categoryParam || location.state?.selectedCategory;
    if (selected) {
      setTimeout(() => {
        setActiveCategory(selected);
        // Scroll after state update
        if (menuListRef.current) {
          menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    }
  }, [location.state, location.search]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    if (menuListRef.current) {
      menuListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuCategories categories={categories} onCategoryClick={handleCategoryClick} loading={categoriesLoading} />

      <div ref={menuListRef} className="scroll-mt-4">
        {productsLoading ? (
          <ProductGridSkeleton count={12} variant="full" />
        ) : (
          <Menulist
          key={activeCategory}
          initialCategory={activeCategory}
          variant="full"
          hideFilter={true}
          products={menuProducts}
          ItemComponent={ViewItems}
          hideCountText={true}
        />
        )}
      </div>
    </div>
  );
}

