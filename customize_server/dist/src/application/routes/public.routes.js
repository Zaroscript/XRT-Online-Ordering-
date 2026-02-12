"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PublicController_1 = require("../controllers/PublicController");
const router = (0, express_1.Router)();
const publicController = new PublicController_1.PublicController();
// Public routes - no authentication required
router.get('/site-settings', publicController.getSiteSettings);
router.get('/testimonials', publicController.getTestimonials);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.getProducts);
exports.default = router;
