import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { authRateLimitMiddleware } from '../middlewares';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authRateLimitMiddleware, authController.register);
router.post('/login', authRateLimitMiddleware, authController.login);
router.post('/refresh-token', authRateLimitMiddleware, authController.refreshToken);
router.post('/forgot-password', authRateLimitMiddleware, authController.forgotPassword);
router.post('/verify-reset-token', authRateLimitMiddleware, authController.verifyResetToken);
router.post('/reset-password', authRateLimitMiddleware, authController.resetPassword);

// Protected routes
router.use(requireAuth);

router.get('/me', authController.getMe);
router.patch('/profile', authController.updateUser); // Reuse updateUser but for self
router.patch('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);

// Admin user management routes
router.post('/users', requirePermission('users:create'), authController.createUser);
router.get('/users', requirePermission('users:read'), authController.getAllUsers);
router.get('/users/:id', requirePermission('users:read'), authController.getUser);
router.patch('/users/:id', requirePermission('users:update'), authController.updateUser);
router.delete('/users/:id', requirePermission('users:delete'), authController.deleteUser);
router.patch('/users/:id/approve', requirePermission('users:approve'), authController.approveUser);
router.patch('/users/:id/ban', requirePermission('users:ban'), authController.banUser);
router.patch(
  '/users/:id/permissions',
  requirePermission('users:update'),
  authController.updateUserPermissions
);
router.get(
  '/users/:id/permissions',
  requirePermission('users:read'),
  authController.getUserPermissions
);
router.get('/permissions', requirePermission('users:read'), authController.getAllPermissions);

export default router;

