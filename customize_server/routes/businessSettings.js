import express from 'express';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from '../controllers/businessSettingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// protect all routes
router.use(protect);

router.route('/').get(getBusinessSettings).patch(updateBusinessSettings);

export default router;
