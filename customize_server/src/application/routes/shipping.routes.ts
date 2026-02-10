import { Router } from 'express';
import { ShippingController } from '../controllers/ShippingController';

const router = Router();
const shippingController = new ShippingController();

// Get all shippings
router.get('/', shippingController.index);

export default router;
