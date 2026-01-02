import { Router } from 'express';
import { WithdrawController } from '../controllers/WithdrawController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const withdrawController = new WithdrawController();

// All withdraw routes require authentication
router.use(requireAuth);

// Get all withdraws - requires withdraws:read permission
router.get('/', requirePermission('withdraws:read'), withdrawController.getAllWithdraws);

// Get withdraw by ID - requires withdraws:read permission
router.get('/:id', requirePermission('withdraws:read'), withdrawController.getWithdraw);

// Create withdraw - requires withdraws:create permission
router.post('/', requirePermission('withdraws:create'), withdrawController.createWithdraw);

// Update withdraw - requires withdraws:update permission
router.patch('/:id', requirePermission('withdraws:update'), withdrawController.updateWithdraw);

// Approve/Reject withdraw - requires withdraws:update permission
router.post('/:id/approve', requirePermission('withdraws:update'), withdrawController.approveWithdraw);

// Delete withdraw - requires withdraws:delete permission
router.delete('/:id', requirePermission('withdraws:delete'), withdrawController.deleteWithdraw);

export default router;

