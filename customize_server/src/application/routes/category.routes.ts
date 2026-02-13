import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';
import { logger } from '../../shared/utils/logger';

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
  (req, res, next) => {
    logger.info('Upload request: POST /categories');
    next();
  },
  (req, res, next) => {
    uploadImage.fields([
      { name: 'image', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        logger.error('Multer upload error (categories):', err.message || err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File too large (Max 5MB)' });
        }
        return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
      }
      const files = (req as any).files;
      logger.info('Multer done for POST /categories, hasFiles:', !!(files && (files.image?.length || files.icon?.length)));
      next();
    });
  },
  categoryController.create
);

// Update category - requires categories:update permission
router.put(
  '/:id',
  requirePermission('categories:update'),
  (req, res, next) => {
    logger.info('Upload request: PUT /categories/:id');
    next();
  },
  (req, res, next) => {
    uploadImage.fields([
      { name: 'image', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        logger.error('Multer upload error (categories):', err.message || err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file',
        });
      }
      const files = (req as any).files;
      logger.info('Multer done for PUT /categories, hasFiles:', !!(files && (files.image?.length || files.icon?.length)));
      next();
    });
  },
  categoryController.update
);

// Delete category - requires categories:delete permission
router.delete('/:id', requirePermission('categories:delete'), categoryController.delete);

export default router;
