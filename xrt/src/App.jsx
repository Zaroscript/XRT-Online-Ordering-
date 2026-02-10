import "./App.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "./Component/Layout/Header.jsx";
import Footer from "./Component/Footer/FooterSection.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import AdsPopup from "./Component/Ads/AdsPopup.jsx";

function App() {
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
