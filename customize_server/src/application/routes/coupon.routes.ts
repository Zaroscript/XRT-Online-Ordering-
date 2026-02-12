import express from 'express';
import { CouponController } from '../controllers/CouponController';

const router = express.Router();
const couponController = new CouponController();

// Public/Protected Routes (Add auth middleware as needed)
router.post('/', couponController.create);
router.get('/', couponController.paginated);
router.get('/:code', couponController.get); // Frontend uses get with code param, check if it uses /:code or ?code=...
// The controller 'get' method checks req.query.code, so it expects /?code=...
// But other routes might conflict.

// Let's match frontend expectation.
// If frontend calls `client.get({ code, language })`, it likely uses query params.
// If frontend calls `client.update`, it likely uses `/:id`.

router.put('/:id', couponController.update);
router.delete('/:id', couponController.delete);

router.post('/verify', couponController.verify);
router.post('/approve', couponController.approve);
router.post('/disapprove', couponController.disapprove);

export default router;
