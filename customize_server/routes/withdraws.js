import express from 'express';
import * as withdrawController from '../controllers/withdrawController.js';
import * as auth from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// Public routes (none for withdraws usually, usually protected)
router.use(auth.protect);

/**
 * @swagger
 * tags:
 *   name: Withdraws
 *   description: Withdraw management
 */

/**
 * @swagger
 * /withdraws:
 *   get:
 *     summary: Get all withdraws (Admin)
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '/',
  requirePermission('withdraws:read'),
  withdrawController.getAllWithdraws
);

/**
 * @swagger
 * /withdraws:
 *   post:
 *     summary: Create a withdraw request
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWithdrawRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Withdraw'
 */
router.post(
  '/',
  // Business owners usually request, might need specific permission or just be a user
  // For now, assuming any authenticated user who owns a business can request, 
  // but let's add a permission check if strict. Common pattern is just check ownership in controller.
  withdrawController.createWithdraw
);

/**
 * @swagger
 * /withdraws/my-withdraws:
 *   get:
 *     summary: Get my withdraws
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Withdraw'
 */
router.get('/my-withdraws', withdrawController.getMyWithdraws);

/**
 * @swagger
 * /withdraws/{id}/status:
 *   patch:
 *     summary: Update withdraw status (Admin)
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWithdrawStatusRequest'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Withdraw'
 */
router.patch(
  '/:id/status',
  requirePermission('withdraws:update'),
  withdrawController.updateWithdrawStatus
);

export default router;
