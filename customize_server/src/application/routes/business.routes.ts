import { Router } from 'express';
import { BusinessController } from '../controllers/BusinessController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const businessController = new BusinessController();

// Single-tenant: one business only. All routes require authentication.
router.use(requireAuth);

router.get('/', businessController.getBusiness);
router.patch('/', businessController.updateBusiness);
// Single-tenant: creating or deleting is disabled
router.post('/', businessController.createBusiness); // returns 403
router.delete('/:id', businessController.deleteBusiness); // returns 403

export default router;
