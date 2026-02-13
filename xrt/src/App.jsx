import "./App.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "./Component/Layout/Header.jsx";
import Footer from "./Component/Footer/FooterSection.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import AdsPopup from "./Component/Ads/AdsPopup.jsx";
import LoadingPage from "./Component/UI/LoadingPage.jsx";

import { useEffect } from "react";
import { useSiteSettingsQuery } from "./api/hooks/useSiteSettings";
import { resolveImageUrl } from "./utils/resolveImageUrl";

function App() {
  const { siteTitle, logo, isLoading } = useSiteSettingsQuery();
  const logoSrc =
    logo && typeof logo === "object"
      ? resolveImageUrl(logo?.original ?? logo?.thumbnail ?? "")
      : resolveImageUrl(typeof logo === "string" ? logo : "");

  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle]);

  useEffect(() => {
    if (!logoSrc) return;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = logoSrc;
    link.type = logoSrc.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/png";
  }, [logoSrc]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <CartProvider>
      <AdsPopup />
      <Header />
      <AppRoutes />
      <Footer />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </CartProvider>
  );
}

export default App;
