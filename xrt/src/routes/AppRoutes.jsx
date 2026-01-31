import { useRoutes } from 'react-router-dom';
<<<<<<< HEAD
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Contact from '../pages/Contact';
import Customize from "../pages/Customize";
import Cart from "../pages/Cart";
import ProductDetails from "../pages/ProductDetails";
=======
import { routes } from '../config/constants';
>>>>>>> d23ba8076a26e1e3e3594e392c6f5dd4b2d46d75

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