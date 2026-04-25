import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';
import { writeRateLimitMiddleware } from '../middlewares';

const router = Router();
const orderController = new OrderController();

// Optional: You can enforce `requireAuth` for all routes securely
// router.use(requireAuth);

// Create order - requires orders:create permission or customer role
router.post(
  '/',
  writeRateLimitMiddleware,
  // requireAuth,
  // requirePermission('orders:create'),
  orderController.create
);

// Get all orders - requires orders:read permission
router.get(
  '/',
  // requireAuth,
  // requirePermission('orders:read'),
  orderController.getAll
);

// Get single order
router.get(
  '/:id',
  // requireAuth,
  // requirePermission('orders:read'),
  orderController.getById
);

// Get print logs for an order
router.get(
  '/:id/print-logs',
  // requireAuth,
  orderController.getPrintLogs
);

// Update order status - requires orders:update permission
router.put(
  '/:id/status',
  writeRateLimitMiddleware,
  // requireAuth,
  // requirePermission('orders:update'),
  orderController.updateStatus
);

// Manual reprint - clear print status and trigger routing (optional body: { printerId? })
router.post(
  '/:id/reprint',
  writeRateLimitMiddleware,
  // requireAuth,
  orderController.reprint
);

// Delete order - requires orders:delete permission
router.delete(
  '/:id',
  // requireAuth,
  // requirePermission('orders:delete'),
  orderController.delete
);

// Refund order (full or partial)
router.post(
  '/:id/refund',
  writeRateLimitMiddleware,
  // requireAuth,
  orderController.refundOrder
);

// Resolve refund action (refund vs void) based on settlement state
router.get(
  '/:id/refund-action',
  // requireAuth,
  orderController.getRefundAction
);

export default router;
