"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerController_1 = require("../controllers/CustomerController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const customerController = new CustomerController_1.CustomerController();
// All customer routes require authentication
router.use(auth_1.requireAuth);
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
exports.default = router;
