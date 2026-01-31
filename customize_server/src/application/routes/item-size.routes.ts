import { Router } from 'express';
import { ItemSizeController } from '../controllers/ItemSizeController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const itemSizeController = new ItemSizeController();

router.use(requireAuth);

// Sort order update - specific route before generic /:id routes
router.post('/sort-order', requireAuth, itemSizeController.updateSortOrder);

// Get all sizes (Global per business)
router.get(
  '/', // Was /:itemId/sizes - now mounted at /api/sizes likely, or need to check mount point
  requirePermission('items:read'),
  itemSizeController.getAll
);

// Get single item size
router.get('/:id', requirePermission('items:read'), itemSizeController.getById);

// Create item size
router.post('/', requirePermission('items:create'), itemSizeController.create);

// Update item size
router.put('/:id', requirePermission('items:update'), itemSizeController.update);

// Delete item size
router.delete('/:id', requirePermission('items:delete'), itemSizeController.delete);

export default router;
