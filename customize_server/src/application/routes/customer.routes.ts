import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication
router.use(requireAuth);

// Get all customers - requires customers:read permission
router.get(
    '/',
    requirePermission('customers:read'),
    customerController.getAll
);

// Check whether customer can be hard-deleted safely
router.get(
    '/:id/delete-safety',
    requirePermission('customers:read'),
    customerController.getDeleteSafety
);

// Get single customer - requires customers:read permission
router.get(
    '/:id',
    requirePermission('customers:read'),
    customerController.getById
);

// Create customer - requires customers:create permission
router.post(
    '/',
    requirePermission('customers:create'),
    customerController.create
);

// Update customer - requires customers:update permission
router.put(
    '/:id',
    requirePermission('customers:update'),
    customerController.update
);

// Delete customer - requires customers:delete permission
router.delete(
    '/:id',
    requirePermission('customers:delete'),
    customerController.delete
);

export default router;
