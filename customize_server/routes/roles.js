import express from 'express';
import * as roleController from '../controllers/roleController.js';
import { requirePermission } from '../middleware/permissions.js';
import * as auth from '../middleware/auth.js';

const router = express.Router();

// All role routes require authentication
router.use(auth.protect);

// Role management routes - require role management permissions
router.post('/', requirePermission('roles:create'), roleController.createRole);
router.get('/', requirePermission('roles:read'), roleController.getAllRoles);
router.get('/:id', requirePermission('roles:read'), roleController.getRoleById);
router.patch('/:id', requirePermission('roles:update'), roleController.updateRole);
router.delete('/:id', requirePermission('roles:delete'), roleController.deleteRole);

// Role assignment routes
router.patch('/users/:id/assign', requirePermission('users:update'), roleController.assignRoleToUser);
router.patch('/users/:id/remove', requirePermission('users:update'), roleController.removeRoleFromUser);
router.get('/users/:roleId', requirePermission('users:read'), roleController.getUsersWithRole);

export default router;
