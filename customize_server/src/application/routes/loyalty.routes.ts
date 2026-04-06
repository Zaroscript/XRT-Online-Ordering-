import express from 'express';
import { LoyaltyController } from '../controllers/LoyaltyController';
// In a real app we'd add `AuthMiddleware.verifyAdmin` around the admin routes
// We will assume that any /api/loyalty/program calls from the dashboard are protected at the router level if needed
const router = express.Router();
const loyaltyController = new LoyaltyController();

// Admin Routes
router.get('/program', loyaltyController.getProgram);
router.put('/program', loyaltyController.upsertProgram);
router.get('/members', loyaltyController.getMembers);
router.get('/members/:id', loyaltyController.getMember);
router.get('/members/:id/transactions', loyaltyController.getMemberTransactions);

// Public Routes (Checkout)
router.post('/lookup', loyaltyController.lookup);
router.post('/join', loyaltyController.join);
router.post('/redeem', loyaltyController.redeem);

export default router;
