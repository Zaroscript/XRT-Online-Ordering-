import express from 'express';
import { TestimonialController } from '../controllers/TestimonialController';

const router = express.Router();
const testimonialController = new TestimonialController();

router.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

router.post('/', testimonialController.create);
router.get('/', testimonialController.paginated);
router.get('/all', testimonialController.getAll);
router.get('/:id', testimonialController.getById);
router.put('/:id', testimonialController.update);
router.delete('/:id', testimonialController.delete);

export default router;
