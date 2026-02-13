import Sliderfun from "../Component/Slider/Slider";
import Categories from "../Component/Categories/Categories";
import AdsList from "../Component/Ads/AdsList";
import Menulist from "../Component/Menu_Items/Menulist";
import { ProductGridSkeleton } from "../Component/Menu_Items/ProductSkeleton";
import TopRated from "../Component/TopRated/TopRated";
import Testimonials from "../Component/Testimonials/Testimonials";
import { useCategoriesQuery, useProductsQuery } from "@/api";

const Home = () => {
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  const { products, loading: productsLoading } = useProductsQuery();
  
  const loading = categoriesLoading || productsLoading;
  
  // Use fetched products, or empty array if loading
  const menuProducts = products || [];
  
  // We can skip the ID re-generation if IDs are stable from DB
  const uniqueMenuProducts = menuProducts;
  
  // Use fetched categories if available, otherwise fallback (or empty)
  const categoryNames = categories.map(item => item.name);
  const initialCategory = categoryNames.length > 0 ? categoryNames[0] : "Pizza";

  return (
    <>
      <Sliderfun />
      <Categories categories={categories} />
      <AdsList />
      {loading ? (
        <div className="px-4 md:px-8 lg:px-[70px] mt-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Menu List</h2>
          <ProductGridSkeleton count={8} variant="home" />
        </div>
      ) : (
        <Menulist 
          variant="home" 
          initialCategory={initialCategory} 
          limit={8} 
          products={uniqueMenuProducts}
          categories={categoryNames}
        />
      )}
      <TopRated />
      <Testimonials />
    </>
  );
};

export default Home;
