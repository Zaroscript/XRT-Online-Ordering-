import { Router } from 'express';
import { BusinessController } from '../controllers/BusinessController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const businessController = new BusinessController();

// All routes require authentication
router.use(requireAuth);

router.post('/', businessController.createBusiness);
router.get('/', businessController.getBusinesses);
router.get('/:id', businessController.getBusinessById);
router.patch('/:id', businessController.updateBusiness);

export default router;

