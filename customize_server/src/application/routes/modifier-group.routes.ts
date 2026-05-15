import { Router } from 'express';
import { ModifierGroupController } from '../controllers/ModifierGroupController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const modifierGroupController = new ModifierGroupController();

// All modifier group routes require authentication
router.use(requireAuth);

// Sort order update - specific route MUST come before generic /:id routes
router.post('/sort-order', modifierGroupController.updateSortOrder);

// Modifiers sort order update within a group
router.post(
  '/:id/modifiers/sort-order',
  requirePermission('modifiers:update'),
  modifierGroupController.updateModifiersSortOrder
);

// Export modifier groups - requires modifier_groups:read permission
router.get(
  '/export',
  requirePermission('modifier_groups:read'),
  modifierGroupController.exportModifierGroups
);

// Get all modifier groups - requires modifier_groups:read permission
router.get('/', requirePermission('modifier_groups:read'), modifierGroupController.getAll);

// Get single modifier group - requires modifier_groups:read permission
router.get('/:id', requirePermission('modifier_groups:read'), modifierGroupController.getById);

// Create modifier group - requires modifier_groups:create permission
router.post('/', requirePermission('modifier_groups:create'), modifierGroupController.create);

// Update modifier group - requires modifier_groups:update permission
router.put('/:id', requirePermission('modifier_groups:update'), modifierGroupController.update);

// Delete modifier group - requires modifier_groups:delete permission
router.delete('/:id', requirePermission('modifier_groups:delete'), modifierGroupController.delete);

export default router;
