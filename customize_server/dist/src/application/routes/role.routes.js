"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoleController_1 = require("../controllers/RoleController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const roleController = new RoleController_1.RoleController();
// All role routes require authentication
router.use(auth_1.requireAuth);
// Get all roles - requires roles:read permission
router.get('/', (0, authorize_1.requirePermission)('roles:read'), roleController.getAllRoles);
// Get role by ID - requires roles:read permission
router.get('/:id', (0, authorize_1.requirePermission)('roles:read'), roleController.getRole);
// Create role - requires roles:create permission
router.post('/', (0, authorize_1.requirePermission)('roles:create'), roleController.createRole);
// Update role - requires roles:update permission
router.patch('/:id', (0, authorize_1.requirePermission)('roles:update'), roleController.updateRole);
// Role assignment to users
router.patch('/users/:userId/assign', (0, authorize_1.requirePermission)('roles:update'), roleController.assignRole);
router.patch('/users/:userId/remove', (0, authorize_1.requirePermission)('roles:update'), roleController.removeRole);
exports.default = router;
