import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Menulist from "../Component/Menu_Items/Menulist";
import ViewItems from "../Component/Menu_Items/ViewItems";
import MenuCategories from "../Component/Menu_Items/MenuCategories";
import { ProductGridSkeleton } from "../Component/Menu_Items/ProductSkeleton";
import { selectPromotion } from "../api/promotions";
import { setAppliedPromotion } from "../utils/promotionStorage";
import { useCategoriesQuery, useProductsQuery } from "@/api";

export default function Menu() {
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  const { products, loading: productsLoading } = useProductsQuery();
  const [activeCategory, setActiveCategory] = useState("Marrow"); // Default, will be updated when categories load
  const menuListRef = useRef(null);
  const menuProducts = products || [];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const promoId = new URLSearchParams(location.search).get("promotion");
    if (!promoId?.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await selectPromotion(promoId.trim(), {});
        const promo = res?.promotion;
        if (!cancelled && promo?.id) {
          setAppliedPromotion({
            id: promo.id,
            headline: promo.headline,
            image_url: promo.image_url,
            template: promo.template,
            cta_label: promo.cta_label,
          });
        }
      } catch {
        // Invalid / inactive promotion — still strip query to avoid loops
      } finally {
        if (!cancelled) {
          navigate({ pathname: location.pathname, search: "" }, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.search, location.pathname, navigate]);

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

