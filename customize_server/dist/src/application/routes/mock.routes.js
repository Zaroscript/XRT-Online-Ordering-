"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MockController_1 = __importDefault(require("../controllers/MockController"));
const router = (0, express_1.Router)();
router.get('/notify-logs', MockController_1.default.getNotifyLogs);
router.get('/conversations', MockController_1.default.getConversations);
router.get('/authors', MockController_1.default.getAuthors);
router.get('/manufacturers', MockController_1.default.getManufacturers);
exports.default = router;
