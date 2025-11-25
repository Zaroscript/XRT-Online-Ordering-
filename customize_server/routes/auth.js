import express from 'express';
import * as authController from '../controllers/authController.js';
import * as auth from '../middleware/auth.js';
import { requirePermission, requireAnyPermission } from '../middleware/permissions.js';

const router = express.Router();

// Authentication routes
router.post('/register', auth.isNotAuthenticated, authController.register);
router.post('/login', auth.isNotAuthenticated, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes - require authentication
router.use(auth.protect);

router.get('/me', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

router.patch('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);

// Admin routes - require specific permissions
router.get('/users', requirePermission('users:read'), authController.getAllUsers);
router.patch('/users/:id/approve', requirePermission('users:approve'), authController.approveUser);
router.patch('/users/:id/ban', requirePermission('users:ban'), authController.banUser);
router.delete('/users/:id', requirePermission('users:delete'), authController.deleteUser);

// Permission management endpoints
router.patch('/users/:id/permissions', requirePermission('users:update'), authController.updateUserPermissions);
router.get('/users/:id/permissions', requirePermission('users:read'), authController.getUserPermissions);
router.get('/permissions', requirePermission('users:read'), authController.getAllPermissions);

export default router;
