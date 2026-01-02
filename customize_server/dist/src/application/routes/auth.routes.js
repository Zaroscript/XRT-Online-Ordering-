"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);
// Protected routes
router.use(auth_1.requireAuth);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);
// Admin user management routes
router.post('/users', (0, authorize_1.requirePermission)('users:create'), authController.createUser);
router.get('/users', (0, authorize_1.requirePermission)('users:read'), authController.getAllUsers);
router.get('/users/:id', (0, authorize_1.requirePermission)('users:read'), authController.getUser);
router.patch('/users/:id', (0, authorize_1.requirePermission)('users:update'), authController.updateUser);
router.delete('/users/:id', (0, authorize_1.requirePermission)('users:delete'), authController.deleteUser);
router.patch('/users/:id/approve', (0, authorize_1.requirePermission)('users:approve'), authController.approveUser);
router.patch('/users/:id/ban', (0, authorize_1.requirePermission)('users:ban'), authController.banUser);
router.patch('/users/:id/permissions', (0, authorize_1.requirePermission)('users:update'), authController.updateUserPermissions);
router.get('/users/:id/permissions', (0, authorize_1.requirePermission)('users:read'), authController.getUserPermissions);
router.get('/permissions', (0, authorize_1.requirePermission)('users:read'), authController.getAllPermissions);
exports.default = router;
