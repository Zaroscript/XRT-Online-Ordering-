"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const roles_1 = require("../../shared/constants/roles");
const router = (0, express_1.Router)();
const categoryController = new CategoryController_1.CategoryController();
// All category routes require authentication
router.use(auth_1.requireAuth);
// Get all categories - accessible by all authenticated users
router.get('/', categoryController.getAll);
// Get single category - accessible by all authenticated users (filtered by business_id inside controller)
router.get('/:id', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), categoryController.getById);
// Create category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.post('/', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
]), categoryController.create);
// Update category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.put('/:id', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
]), categoryController.update);
// Delete category - requires BUSINESS_ADMIN or SUPER_ADMIN
router.delete('/:id', (0, authorize_1.authorizeRoles)(roles_1.UserRole.BUSINESS_ADMIN, roles_1.UserRole.SUPER_ADMIN), categoryController.delete);
exports.default = router;
