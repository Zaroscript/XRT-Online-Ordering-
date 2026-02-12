"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShippingController_1 = require("../controllers/ShippingController");
const router = (0, express_1.Router)();
const shippingController = new ShippingController_1.ShippingController();
// Get all shippings
router.get('/', shippingController.index);
exports.default = router;
