import { Router } from 'express';
import { TaxController } from '../controllers/TaxController';

const router = Router();
const taxController = new TaxController();

// Get all taxes
router.get('/', taxController.index);

export default router;
