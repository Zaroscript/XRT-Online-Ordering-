import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { UserRole } from '../../shared/constants/roles';

const router = Router();
const controller = new AnalyticsController();

router.get('/', requireAuth, authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN), controller.getAnalytics);

router.get('/popular-items', requireAuth, authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN), controller.getPopularItems);
router.get('/less-sold-items', requireAuth, authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN), controller.getLessSoldItems);

export default router;
