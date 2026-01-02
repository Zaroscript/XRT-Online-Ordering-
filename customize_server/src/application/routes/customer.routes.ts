import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication
router.use(requireAuth);

// Get all customers - accessible by all authenticated users
router.get('/', customerController.getAll);

// Get single customer - accessible by all authenticated users
router.get('/:id', customerController.getById);

// Create customer
router.post('/', customerController.create);

// Update customer
router.put('/:id', customerController.update);

// Delete customer
router.delete('/:id', customerController.delete);

export default router;

