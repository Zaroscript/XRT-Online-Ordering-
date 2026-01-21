"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModifierController_1 = require("../controllers/ModifierController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const modifierController = new ModifierController_1.ModifierController();
// All modifier routes require authentication
router.use(auth_1.requireAuth);
// Get all modifiers - requires modifiers:read permission
router.get('/modifiers', (0, authorize_1.requirePermission)('modifiers:read'), modifierController.index);
// Get all modifiers for a group - requires modifiers:read permission
router.get('/modifier-groups/:groupId/modifiers', (0, authorize_1.requirePermission)('modifiers:read'), modifierController.getAll);
// Get single modifier - requires modifiers:read permission
router.get('/modifier-groups/:groupId/modifiers/:id', (0, authorize_1.requirePermission)('modifiers:read'), modifierController.getById);
// Create modifier - requires modifiers:create permission
router.post('/modifier-groups/:groupId/modifiers', (0, authorize_1.requirePermission)('modifiers:create'), modifierController.create);
// Update modifier - requires modifiers:update permission
router.put('/modifier-groups/:groupId/modifiers/:id', (0, authorize_1.requirePermission)('modifiers:update'), modifierController.update);
// Delete modifier - requires modifiers:delete permission
router.delete('/modifier-groups/:groupId/modifiers/:id', (0, authorize_1.requirePermission)('modifiers:delete'), modifierController.delete);
exports.default = router;
