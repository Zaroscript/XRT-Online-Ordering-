"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TestimonialController_1 = require("../controllers/TestimonialController");
const router = express_1.default.Router();
const testimonialController = new TestimonialController_1.TestimonialController();
router.get('/test', (req, res) => {
    res.json({ message: 'Test route works' });
});
router.post('/', testimonialController.create);
router.get('/', testimonialController.paginated);
router.get('/all', testimonialController.getAll);
router.get('/:id', testimonialController.getById);
router.put('/:id', testimonialController.update);
router.delete('/:id', testimonialController.delete);
exports.default = router;
