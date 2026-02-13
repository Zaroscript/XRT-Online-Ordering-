import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { uploadImage } from '../middlewares/upload';
import { logger } from '../../shared/utils/logger';

const router = Router();
const itemController = new ItemController();

const logUpload = (method: string) => (req: any, res: any, next: any) => {
  logger.info('Upload request:', method, '/items');
  next();
};

// All item routes require authentication
router.use(requireAuth);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, itemController.updateSortOrder);

// Export items - requires items:read permission
router.get('/export', requirePermission('items:read'), itemController.exportItems);

// Get all items - requires items:read permission
router.get('/', requirePermission('items:read'), itemController.getAll);

// Get single item - requires items:read permission
router.get('/:id', requirePermission('items:read'), itemController.getById);

// Create item - requires items:create permission
router.post(
  '/',
  requirePermission('items:create'),
  logUpload('POST'),
  uploadImage.fields([{ name: 'image', maxCount: 1 }]),
  (req, res, next) => {
    logger.info('Multer done for POST /items, hasFiles:', !!(req.files && (req.files as any).image?.length));
    next();
  },
  itemController.create
);

// Update item - requires items:update permission
router.put(
  '/:id',
  requirePermission('items:update'),
  logUpload('PUT'),
  uploadImage.fields([{ name: 'image', maxCount: 1 }]),
  (req, res, next) => {
    logger.info('Multer done for PUT /items, hasFiles:', !!(req.files && (req.files as any).image?.length));
    next();
  },
  itemController.update
);

// Delete item - requires items:delete permission
router.delete('/:id', requirePermission('items:delete'), itemController.delete);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, itemController.updateSortOrder);

// Get all items - requires items:read permission

export default router;
