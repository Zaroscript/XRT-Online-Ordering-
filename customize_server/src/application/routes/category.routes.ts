import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';
import { UserRole } from '../../shared/constants/roles';

const router = Router();
const categoryController = new CategoryController();

// All category routes require authentication
router.use(requireAuth);

// Get all categories - accessible by all authenticated users
router.get('/', categoryController.getAll);

// Get single category - accessible by all authenticated users (filtered by business_id inside controller)
router.get(
  '/:id',
  authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
  categoryController.getById
);

// Create category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.post(
  '/',
  authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  categoryController.create
);

// Update category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.put(
  '/:id',
  authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  categoryController.update
);

// Delete category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.delete(
  '/:id',
  authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
  categoryController.delete
);

export default router;

