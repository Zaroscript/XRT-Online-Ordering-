import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';
import { UserRole } from '../../shared/constants/roles';

const router = Router();
const itemController = new ItemController();

// All item routes require authentication
router.use(requireAuth);

// Get all items - accessible by all authenticated users
router.get('/', itemController.getAll);

// Get single item - accessible by all authenticated users
router.get(
    '/:id',
    itemController.getById
);

// Create item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.post(
    '/',
    authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
    uploadImage.fields([
        { name: 'image', maxCount: 1 },
    ]),
    itemController.create
);

// Update item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.put(
    '/:id',
    authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
    uploadImage.fields([
        { name: 'image', maxCount: 1 },
    ]),
    itemController.update
);

// Delete item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.delete(
    '/:id',
    authorizeRoles(UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN),
    itemController.delete
);

export default router;
