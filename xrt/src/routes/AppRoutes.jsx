import { useRoutes } from 'react-router-dom';
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Contact from '../pages/Contact';
import Customize from "../pages/Customize";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Payment from "../pages/Payment";
import ProductDetails from "../pages/ProductDetails";
import OrderSuccess from "../pages/OrderSuccess";
import TermsAndConditions from "../pages/TermsAndConditions";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path:"/menu",
    element:<Menu/>
  },
  {
    path: "/customize",
    element: <Customize />,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/payment",
    element: <Payment />,
  },
  {
    path: "/order-success",
    element: <OrderSuccess />,
  },
  {
    path: "/terms-and-conditions",
    element: <TermsAndConditions />,
  },
  {
    path: "/product/:id",
    element: <ProductDetails />,
  }
];

const AppRoutes = () => {
    const routing = useRoutes(routes)
  return routing
}

export default AppRoutes;
