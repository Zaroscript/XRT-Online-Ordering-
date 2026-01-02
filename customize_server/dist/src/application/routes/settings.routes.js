"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SettingsController_1 = require("../controllers/SettingsController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const settingsController = new SettingsController_1.SettingsController();
// All settings routes require authentication
router.use(auth_1.requireAuth);
// Get settings
router.get('/', settingsController.getSettings);
// Update settings
router.patch('/', settingsController.updateSettings);
exports.default = router;
