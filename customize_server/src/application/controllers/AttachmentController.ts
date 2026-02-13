import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';
import { CloudinaryStorage } from '../../infrastructure/cloudinary/CloudinaryStorage';

/** Normalize req.files to an array (multer .any() returns array; some typings use object). */
function normalizeFiles(req: Request): Express.Multer.File[] {
  const raw = (req as any).files;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    const list: Express.Multer.File[] = [];
    Object.values(raw).forEach((v) => {
      if (Array.isArray(v)) list.push(...v);
      else if (v && typeof v === 'object' && (v as any).originalname) list.push(v as Express.Multer.File);
    });
    return list;
  }
  return [];
}

function getBaseUrl(req: Request): string {
  const fromEnv = (env as any).PUBLIC_ORIGIN;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host') || ''}`.replace(/\/$/, '');
}

const useCloudinary =
  env.ATTACHMENT_STORAGE === 'cloudinary' &&
  !!env.CLOUDINARY_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET;

export class AttachmentController {
  private imageStorage = new CloudinaryStorage();

  upload = asyncHandler(async (req: Request, res: Response) => {
    const files = normalizeFiles(req);
    logger.info('AttachmentController.upload: files count =', files.length);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Make sure you selected an image (max 5MB).',
      });
    }

    const baseUrl = getBaseUrl(req);

    if (useCloudinary) {
      const attachments = [];
      for (const file of files as Express.Multer.File[]) {
        const result = await this.imageStorage.uploadImage(file, 'xrttech/attachments');
        attachments.push({
          id: result.public_id,
          thumbnail: result.secure_url,
          original: result.secure_url,
          file_name: file.originalname,
        });
      }
      logger.info('AttachmentController.upload: returning', attachments.length, 'attachments (Cloudinary)');
      return sendSuccess(res, 'Files uploaded successfully', attachments);
    }

    const attachments = (files as any[]).map((file: any) => {
      let url: string | undefined = file.secure_url || file.url || file.path;
      if (url && typeof url === 'string' && !url.startsWith('http')) {
        url = `${baseUrl}/uploads/${file.filename || file.originalname}`;
      }
      const imageUrl = url || '';
      const publicId = file.public_id || file.filename || file.originalname;
      return {
        id: publicId,
        thumbnail: imageUrl,
        original: imageUrl,
        file_name: file.originalname,
      };
    });

    logger.info('AttachmentController.upload: returning', attachments.length, 'attachments');
    return sendSuccess(res, 'Files uploaded successfully', attachments);
  });
}
