import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const roleController = new RoleController();

// All role routes require authentication
router.use(requireAuth);

// Get all roles - requires roles:read permission
router.get('/', requirePermission('roles:read'), roleController.getAllRoles);

// Get role by ID - requires roles:read permission
router.get('/:id', requirePermission('roles:read'), roleController.getRole);

// Create role - requires roles:create permission
router.post('/', requirePermission('roles:create'), roleController.createRole);

// Update role - requires roles:update permission
router.patch('/:id', requirePermission('roles:update'), roleController.updateRole);

// Role assignment to users
router.patch('/users/:userId/assign', requirePermission('roles:update'), roleController.assignRole);
router.patch('/users/:userId/remove', requirePermission('roles:update'), roleController.removeRole);

export default router;

