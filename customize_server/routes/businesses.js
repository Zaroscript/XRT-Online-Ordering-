import express from 'express';
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
} from '../controllers/businessController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// protect all routes
router.use(protect);

router.route('/').post(createBusiness).get(getBusinesses);

router.route('/:id').get(getBusinessById).patch(updateBusiness);

export default router;
