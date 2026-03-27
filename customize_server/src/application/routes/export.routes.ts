import { Router } from 'express';
import { ExportController } from '../controllers/ExportController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const exportController = new ExportController();

// Use requireAuth; more granular permissions can be added inside ExportController if needed
router.get('/all', requireAuth, exportController.exportAll);

export default router;
