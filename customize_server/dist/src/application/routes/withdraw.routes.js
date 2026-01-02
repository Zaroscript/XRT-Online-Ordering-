"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WithdrawController_1 = require("../controllers/WithdrawController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const withdrawController = new WithdrawController_1.WithdrawController();
// All withdraw routes require authentication
router.use(auth_1.requireAuth);
// Get all withdraws - requires withdraws:read permission
router.get('/', (0, authorize_1.requirePermission)('withdraws:read'), withdrawController.getAllWithdraws);
// Get withdraw by ID - requires withdraws:read permission
router.get('/:id', (0, authorize_1.requirePermission)('withdraws:read'), withdrawController.getWithdraw);
// Create withdraw - requires withdraws:create permission
router.post('/', (0, authorize_1.requirePermission)('withdraws:create'), withdrawController.createWithdraw);
// Update withdraw - requires withdraws:update permission
router.patch('/:id', (0, authorize_1.requirePermission)('withdraws:update'), withdrawController.updateWithdraw);
// Approve/Reject withdraw - requires withdraws:update permission
router.post('/:id/approve', (0, authorize_1.requirePermission)('withdraws:update'), withdrawController.approveWithdraw);
// Delete withdraw - requires withdraws:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('withdraws:delete'), withdrawController.deleteWithdraw);
exports.default = router;
