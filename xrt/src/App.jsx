import "./App.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "./Component/Layout/Header.jsx";
import Footer from "./Component/Footer/FooterSection.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LoyaltyProvider } from "./context/LoyaltyContext.jsx";
import AdsPopup from "./Component/Ads/AdsPopup.jsx";
import LoadingPage from "./Component/UI/LoadingPage.jsx";
import MaintenanceScreen from "./Component/Maintenance/MaintenanceScreen.jsx";

import { useEffect } from "react";
import { useSiteSettingsQuery } from "./api/hooks/useSiteSettings";
import { resolveImageUrl } from "./utils/resolveImageUrl";
import { isMaintenanceBlocking } from "./utils/siteMaintenance";
import { useSiteDocumentMeta } from "./hooks/useSiteDocumentMeta";
import { applyWebsiteBrandTheme } from "./utils/themeUtils";

function App() {
  const query = useSiteSettingsQuery();
  const { logo, isLoading, data } = query;
  const logoSrc =
    logo && typeof logo === "object"
      ? resolveImageUrl(logo?.original ?? logo?.thumbnail ?? "")
      : resolveImageUrl(typeof logo === "string" ? logo : "");

  useSiteDocumentMeta(data);

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

  useEffect(() => {
    if (data) {
      const options = data.options || {};
      const primary = data.primary_color || options.primary_color || "#5C9963";
      const secondary = data.secondary_color || options.secondary_color || "#2F3E30";
      applyWebsiteBrandTheme(primary, secondary);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isMaintenanceBlocking(data)) {
    return <MaintenanceScreen settings={data} />;
  }

  return (
    <LoyaltyProvider>
      <CartProvider>
        <AdsPopup />
        <Header />
        <AppRoutes />
        <Footer />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </CartProvider>
    </LoyaltyProvider>
  );
}

export default App;
