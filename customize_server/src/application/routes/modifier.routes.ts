import { Router } from 'express';
import { ModifierController } from '../controllers/ModifierController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const modifierController = new ModifierController();

// All modifier routes require authentication
router.use(requireAuth);

// Sort order update - specific route before generic /:id routes
router.post(
  '/modifier-groups/:groupId/modifiers/sort-order',
  requireAuth,
  modifierController.updateSortOrder
);

// Get all modifiers - requires modifiers:read permission
router.get('/modifiers', requirePermission('modifiers:read'), modifierController.index);

// Get all modifiers for a group - requires modifiers:read permission
router.get(
  '/modifier-groups/:groupId/modifiers',
  requirePermission('modifiers:read'),
  modifierController.getAll
);

// Get single modifier - requires modifiers:read permission
router.get(
  '/modifier-groups/:groupId/modifiers/:id',
  requirePermission('modifiers:read'),
  modifierController.getById
);

// Create modifier - requires modifiers:create permission
router.post(
  '/modifier-groups/:groupId/modifiers',
  requirePermission('modifiers:create'),
  modifierController.create
);

// Update modifier - requires modifiers:update permission
router.put(
  '/modifier-groups/:groupId/modifiers/:id',
  requirePermission('modifiers:update'),
  modifierController.update
);

// Delete modifier - requires modifiers:delete permission
router.delete(
  '/modifier-groups/:groupId/modifiers/:id',
  requirePermission('modifiers:delete'),
  modifierController.delete
);
export default router;
