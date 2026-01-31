import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';

const router = Router();
const categoryController = new CategoryController();

// All category routes require authentication
router.use(requireAuth);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, categoryController.updateSortOrder);

// Export categories - requires categories:read permission
router.get('/export', requirePermission('categories:read'), categoryController.exportCategories);

// Import categories - requires categories:create (and potentially update) permission
router.post(
  '/import',
  requirePermission('categories:create'),
  uploadImage.single('csv'), // Using single file upload with key 'csv'
  categoryController.importCategories
);

// Get all categories - requires categories:read permission
router.get('/', requirePermission('categories:read'), categoryController.getAll);

// Get single category - requires categories:read permission
router.get('/:id', requirePermission('categories:read'), categoryController.getById);

// Create category - requires categories:create permission
router.post(
  '/',
  requirePermission('categories:create'),
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  categoryController.create
);

// Update category - requires categories:update permission
router.put(
  '/:id',
  requirePermission('categories:update'),
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  categoryController.update
);

// Delete category - requires categories:delete permission
router.delete('/:id', requirePermission('categories:delete'), categoryController.delete);

export default router;
