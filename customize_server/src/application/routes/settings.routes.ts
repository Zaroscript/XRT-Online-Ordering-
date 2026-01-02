import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const settingsController = new SettingsController();

// All settings routes require authentication
router.use(requireAuth);

// Get settings
router.get('/', settingsController.getSettings);

// Update settings
router.patch('/', settingsController.updateSettings);

export default router;

