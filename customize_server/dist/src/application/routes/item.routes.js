"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemController_1 = require("../controllers/ItemController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const roles_1 = require("../../shared/constants/roles");
const router = (0, express_1.Router)();
const itemController = new ItemController_1.ItemController();
// All item routes require authentication
router.use(auth_1.requireAuth);
// Get all items - accessible by all authenticated users
router.get('/', itemController.getAll);
// Get single item - accessible by all authenticated users
router.get('/:id', itemController.getById);
// Create item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.post('/', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
]), itemController.create);
// Update item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.put('/:id', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
]), itemController.update);
// Delete item - requires BUSINESS_ADMIN or SUPER_ADMIN
router.delete('/:id', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), itemController.delete);
exports.default = router;
