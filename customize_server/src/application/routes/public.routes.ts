import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';
import { AuthorizeNetController } from '../controllers/AuthorizeNetController';

const router = Router();
const publicController = new PublicController();
const authorizeNetController = new AuthorizeNetController();

// Public routes - no authentication required
router.get('/site-settings', publicController.getSiteSettings);
router.get('/testimonials', publicController.getTestimonials);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.getProducts);
router.post('/orders', publicController.createOrder);
router.post('/coupons/verify', publicController.verifyCoupon);
router.post('/authorize-net/iframe-token', authorizeNetController.getIframeToken);
router.get('/authorize-net/env', publicController.getAuthorizeNetEnvironment);

export default router;
