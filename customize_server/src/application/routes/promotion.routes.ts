import express from 'express';
import { PromotionController } from '../controllers/PromotionController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = express.Router();
const promotionController = new PromotionController();

router.use(requireAuth);

router.post(
  '/',
  requirePermission('coupons:create'),
  promotionController.create
);
router.get('/', requirePermission('coupons:read'), promotionController.paginated);
router.post('/sort-order', requirePermission('coupons:update'), promotionController.updateSortOrder);
router.get('/:id', requirePermission('coupons:read'), promotionController.getById);
router.put('/:id', requirePermission('coupons:update'), promotionController.update);
router.delete('/:id', requirePermission('coupons:delete'), promotionController.delete);

export default router;
