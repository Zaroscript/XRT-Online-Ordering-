import express from 'express';
import { PriceController } from '../controllers/PriceController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { UserRole } from '../../shared/constants/roles';

const router = express.Router();
const priceController = new PriceController();

// Only Super Admin and Business Admin can access these
router.post(
  '/bulk-update',
  requireAuth,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN),
  priceController.bulkUpdate
);

router.post(
  '/rollback/:id',
  requireAuth,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN),
  priceController.rollback
);

router.get(
  '/history',
  requireAuth,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN),
  priceController.getHistory
);

router.delete(
  '/history/:id',
  requireAuth,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN),
  priceController.deleteHistory
);

router.delete(
  '/history',
  requireAuth,
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN),
  priceController.clearHistory
);

export default router;
