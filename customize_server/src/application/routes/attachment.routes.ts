import { Router, Request, Response, NextFunction } from 'express';
import { AttachmentController } from '../controllers/AttachmentController';
import { uploadAttachment } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth';
import { logger } from '../../shared/utils/logger';

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
          'Upload timed out after 5 minutes. Try a smaller image or check your Cloudinary connection.',
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

router.post(
  '/',
  (req, res, next) => {
    logger.info('Upload request: POST /attachments');
    next();
  },
  requireAuth,
  uploadTimeout,
  (req, res, next) => {
    uploadAttachment.any()(req, res, (err) => {
      if (err) {
        logger.error('Multer upload error:', err.message || err);
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
      const files = (req as any).files;
      const count = Array.isArray(files) ? files.length : files && typeof files === 'object' ? Object.values(files).flat().length : 0;
      logger.info('Multer done for /attachments, files:', count);
      next();
    });
  },
  attachmentController.upload
);

export default router;
