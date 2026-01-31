import { useRoutes } from 'react-router-dom';
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Contact from '../pages/Contact';
import Customize from "../pages/Customize";
import Cart from "../pages/Cart";
import ProductDetails from "../pages/ProductDetails";

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
    path: "/product/:id",
    element: <ProductDetails />,
  }
];

const AppRoutes = () => {
    const routing = useRoutes(routes)
  return routing
}

export default AppRoutes;