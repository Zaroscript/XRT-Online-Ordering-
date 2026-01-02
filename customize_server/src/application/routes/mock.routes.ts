import { Router } from 'express';
import MockController from '../controllers/MockController';

const router = Router();

router.get('/notify-logs', MockController.getNotifyLogs);
router.get('/conversations', MockController.getConversations);
router.get('/authors', MockController.getAuthors);
router.get('/manufacturers', MockController.getManufacturers);

export default router;
