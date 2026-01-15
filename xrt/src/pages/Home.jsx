import React from "react";
import Sliderfun from "../Component/Slider/Slider";
import Categories from "../Component/Categories/Categories";
import AdsList from "../Component/Ads/AdsList";
import Menulist from "../Component/Menu_Items/Menulist";
import TopRated from "../Component/TopRated/TopRated";
import Testimonials from "../Component/Testimonials/Testimonials";
import FooterSection from "../Component/Footer/FooterSection";
import { Categories_items, products as defaultProducts } from "../config/constants";

const Home = () => {
  const menuProducts = defaultProducts;
  
  const uniqueMenuProducts = React.useMemo(() => {
    return menuProducts.map((item, index) => ({
      ...item,
      id: `${item.id}-${index}`
    }));
  }, [menuProducts]);
  
  const homeCategories = Categories_items.slice(0, 5).map(item => item.name);
  const initialCategory = homeCategories[0];

  return (
    <>
      <Sliderfun />
      <Categories />
      <AdsList />
      <Menulist 
        variant="home" 
        initialCategory={initialCategory} 
        limit={8} 
        products={uniqueMenuProducts}
        categories={homeCategories}
      />
      <TopRated />
      <Testimonials />
    </>
  );
};

export default Home;
