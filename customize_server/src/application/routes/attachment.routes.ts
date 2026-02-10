import { Router, Request, Response, NextFunction } from 'express';
import { AttachmentController } from '../controllers/AttachmentController';
import { uploadAttachment } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const attachmentController = new AttachmentController();

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for Cloudinary / slow connections

/** Set request/response timeout so we return 504 if upload hangs (e.g. Cloudinary very slow). */
function uploadTimeout(req: Request, res: Response, next: NextFunction) {
  req.setTimeout(UPLOAD_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message:
          'Upload timed out after 5 minutes. Try a smaller image or set ATTACHMENT_STORAGE=disk in the server .env to use local storage.',
      });
    }
  });
  res.setTimeout(UPLOAD_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: 'Upload timed out.',
      });
    }
  });
  next();
}

// Use any() to allow dynamic field names (e.g. 'icon', 'image', 'attachment[]') from client
// uploadAttachment uses Cloudinary or disk storage so we get real URLs for hero slides etc.
router.post(
  '/',
  requireAuth,
  uploadTimeout,
  (req, res, next) => {
    uploadAttachment.any()(req, res, (err) => {
      if (err) {
        console.error('Multer Upload Error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
            error: 'LIMIT_FILE_SIZE',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file',
          error: err.name || 'UploadError',
        });
      }
      next();
    });
  },
  attachmentController.upload
);

export default router;
