import { Router } from 'express';
import { PrinterController } from '../controllers/PrinterController';
import { PrinterLogController } from '../controllers/PrinterLogController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const printerController = new PrinterController();
const printerLogController = new PrinterLogController();

router.get('/', requireAuth, printerController.getAll);
router.get('/scan', requireAuth, printerController.scanWiFi);
router.get('/scan-lan', requireAuth, printerController.scanLAN);
router.get('/scan-bluetooth', requireAuth, printerController.scanBluetooth);
router.get('/discover-serial', requireAuth, printerController.discoverSerial);
router.get('/:id/logs', requireAuth, printerLogController.listByPrinterId);
router.get('/:id', requireAuth, printerController.getById);
router.post('/', requireAuth, printerController.create);
router.put('/:id', requireAuth, printerController.update);
router.delete('/:id', requireAuth, printerController.delete);
router.post('/:id/check-connection', requireAuth, printerController.checkConnection);
router.post('/:id/test-print', requireAuth, printerController.testPrint);

export default router;
