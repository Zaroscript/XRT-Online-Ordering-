import "./App.css";
import Header from "./Component/Layout/Header.jsx";
import Footer from "./Component/Footer/FooterSection.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { CartProvider } from "./context/CartContext.jsx";

function App() {
  return (
    <CartProvider>
      <Header />
      <AppRoutes />
      <Footer/>
    </CartProvider>
  );
}

export default App;
