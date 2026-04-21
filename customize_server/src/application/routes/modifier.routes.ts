import { Router } from 'express';
import { ModifierController } from '../controllers/ModifierController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const modifierController = new ModifierController();

// Modifier routes need explicit authentication instead of global router.use
// to prevent bleeding into other routes mounted on the same base path.

// Sort order update - specific route MUST come before generic /:id routes
router.post(
  '/modifier-groups/:groupId/modifiers/sort-order',
  requireAuth,
  modifierController.updateSortOrder
);

// Export modifiers
router.get(
  '/modifiers/export',
  requireAuth,
  requirePermission('modifiers:read'),
  modifierController.exportModifiers
);

// Get all modifiers - requires modifiers:read permission
router.get(
  '/modifiers',
  requireAuth,
  requirePermission('modifiers:read'),
  modifierController.index
);

// Get all modifiers for a group - requires modifiers:read permission
router.get(
  '/modifier-groups/:groupId/modifiers',
  requireAuth,
  requirePermission('modifiers:read'),
  modifierController.getAll
);

// Get single modifier - requires modifiers:read permission
router.get(
  '/modifier-groups/:groupId/modifiers/:id',
  requireAuth,
  requirePermission('modifiers:read'),
  modifierController.getById
);

// Create modifier - requires modifiers:create permission
router.post(
  '/modifier-groups/:groupId/modifiers',
  requireAuth,
  requirePermission('modifiers:create'),
  modifierController.create
);

// Update modifier - requires modifiers:update permission
router.put(
  '/modifier-groups/:groupId/modifiers/:id',
  requireAuth,
  requirePermission('modifiers:update'),
  modifierController.update
);

// Delete modifier - requires modifiers:delete permission
router.delete(
  '/modifier-groups/:groupId/modifiers/:id',
  requireAuth,
  requirePermission('modifiers:delete'),
  modifierController.delete
);
export default router;
