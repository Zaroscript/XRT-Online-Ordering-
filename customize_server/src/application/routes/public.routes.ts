import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

const router = Router();
const publicController = new PublicController();

// Public routes - no authentication required
router.get('/site-settings', publicController.getSiteSettings);

export default router;
