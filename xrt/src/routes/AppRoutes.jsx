import { Route, Routes, useRoutes } from 'react-router-dom';
import Home from "@/pages/Home.jsx"
import Contact from '../pages/Contact';
import { routes } from '../config/constants';


const AppRoutes = () => {
    const routing = useRoutes(routes)
  return routing
}

export default AppRoutes