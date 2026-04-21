import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';
import { AuthorizeNetController } from '../controllers/AuthorizeNetController';
import { writeRateLimitMiddleware } from '../middlewares';

const router = Router();
const publicController = new PublicController();
const authorizeNetController = new AuthorizeNetController();

// Public routes - no authentication required
router.get('/site-settings', publicController.getSiteSettings);
router.get('/testimonials', publicController.getTestimonials);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.getProducts);
router.post('/orders', writeRateLimitMiddleware, publicController.createOrder);
router.post('/coupons/verify', writeRateLimitMiddleware, publicController.verifyCoupon);
router.post(
  '/authorize-net/iframe-token',
  writeRateLimitMiddleware,
  authorizeNetController.getIframeToken
);
router.get('/authorize-net/env', publicController.getAuthorizeNetEnvironment);

export default router;
