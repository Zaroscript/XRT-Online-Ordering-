import { Router } from 'express';
import { PrinterController } from '../controllers/PrinterController';
import { PrinterLogController } from '../controllers/PrinterLogController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const printerController = new PrinterController();
const printerLogController = new PrinterLogController();

router.get('/', requireAuth, requirePermission('printers:read'), printerController.getAll);
router.get('/scan', requireAuth, requirePermission('printers:scan'), printerController.scanWiFi);
router.get('/scan-lan', requireAuth, requirePermission('printers:scan'), printerController.scanLAN);
router.get('/scan-bluetooth', requireAuth, requirePermission('printers:scan'), printerController.scanBluetooth);
router.get('/discover-serial', requireAuth, requirePermission('printers:scan'), printerController.discoverSerial);
router.get('/:id/logs', requireAuth, requirePermission('printers:read'), printerLogController.listByPrinterId);
router.get('/:id', requireAuth, requirePermission('printers:read'), printerController.getById);
router.post('/', requireAuth, requirePermission('printers:create'), printerController.create);
router.put('/:id', requireAuth, requirePermission('printers:update'), printerController.update);
router.delete('/:id', requireAuth, requirePermission('printers:delete'), printerController.delete);
router.post('/:id/check-connection', requireAuth, requirePermission('printers:test'), printerController.checkConnection);
router.post('/:id/test-print', requireAuth, requirePermission('printers:test'), printerController.testPrint);

export default router;
