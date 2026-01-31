import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';

const router = Router();
const itemController = new ItemController();

// All item routes require authentication
router.use(requireAuth);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, itemController.updateSortOrder);

// Get all items - requires items:read permission
router.get('/', requirePermission('items:read'), itemController.getAll);

// Get single item - requires items:read permission
router.get('/:id', requirePermission('items:read'), itemController.getById);

// Create item - requires items:create permission
router.post(
  '/',
  requirePermission('items:create'),
  uploadImage.fields([{ name: 'image', maxCount: 1 }]),
  itemController.create
);

// Update item - requires items:update permission
router.put(
  '/:id',
  requirePermission('items:update'),
  uploadImage.fields([{ name: 'image', maxCount: 1 }]),
  itemController.update
);

// Delete item - requires items:delete permission
router.delete('/:id', requirePermission('items:delete'), itemController.delete);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, itemController.updateSortOrder);

// Get all items - requires items:read permission

export default router;
