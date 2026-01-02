import { Router } from 'express';
import { AttachmentController } from '../controllers/AttachmentController';
import { uploadImage } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const attachmentController = new AttachmentController();

// Use any() to be flexible with field names, or use array('attachment[]') to match frontend
router.post('/', requireAuth, uploadImage.array('attachment[]'), attachmentController.upload);

export default router;
