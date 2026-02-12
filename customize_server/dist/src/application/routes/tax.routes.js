"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaxController_1 = require("../controllers/TaxController");
const router = (0, express_1.Router)();
const taxController = new TaxController_1.TaxController();
// Get all taxes
router.get('/', taxController.index);
exports.default = router;
