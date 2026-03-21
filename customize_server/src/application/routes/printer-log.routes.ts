import { Router } from 'express';
import { PrinterLogController } from '../controllers/PrinterLogController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const controller = new PrinterLogController();

router.get('/', requireAuth, controller.listAll);

export default router;
