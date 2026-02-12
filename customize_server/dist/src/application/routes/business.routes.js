"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BusinessController_1 = require("../controllers/BusinessController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const businessController = new BusinessController_1.BusinessController();
// Single-tenant: one business only. All routes require authentication.
router.use(auth_1.requireAuth);
router.get('/', businessController.getBusiness);
router.patch('/', businessController.updateBusiness);
// Single-tenant: creating or deleting is disabled
router.post('/', businessController.createBusiness); // returns 403
router.delete('/:id', businessController.deleteBusiness); // returns 403
exports.default = router;
