import Sliderfun from "../Component/Slider/Slider";
import Categories from "../Component/Categories/Categories";
import AdsList from "../Component/Ads/AdsList";
import Menulist from "../Component/Menu_Items/Menulist";
import TopRated from "../Component/TopRated/TopRated";
import Testimonials from "../Component/Testimonials/Testimonials";
import { Categories_items, products as defaultProducts } from "../config/constants";
import { useMemo } from "react";
import useCategories from "../hooks/useCategories";
import useProducts from "../hooks/useProducts";

const Home = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts();
  
  const loading = categoriesLoading || productsLoading;
  
  // Use fetched products, or empty array if loading
  const menuProducts = products || [];
  
  // We can skip the ID re-generation if IDs are stable from DB
  const uniqueMenuProducts = menuProducts;
  
  // Use fetched categories if available, otherwise fallback (or empty)
  const categoryNames = categories.map(item => item.name);
  const initialCategory = categoryNames.length > 0 ? categoryNames[0] : "Pizza"; // Fallback to Pizza if empty

  if (loading) return null; // Or a loading spinner for the whole page

  return (
    <>
      <Sliderfun />
      <Categories categories={categories} />
      <AdsList />
      <Menulist 
        variant="home" 
        initialCategory={initialCategory} 
        limit={8} 
        products={uniqueMenuProducts}
        categories={categoryNames}
      />
      <TopRated />
      <Testimonials />
    </>
  );
};

export default Home;
