import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

const router = Router();
const publicController = new PublicController();

// Public routes - no authentication required
router.get('/site-settings', publicController.getSiteSettings);
router.get('/testimonials', publicController.getTestimonials);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.getProducts);

export default router;
