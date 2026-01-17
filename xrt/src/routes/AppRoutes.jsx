import { useRoutes } from 'react-router-dom';
import { routes } from '../config/constants';


const AppRoutes = () => {
    const routing = useRoutes(routes)
  return routing
}

export default AppRoutes