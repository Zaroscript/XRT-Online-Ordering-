import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';

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

export class AttachmentController {
  upload = asyncHandler(async (req: Request, res: Response) => {
    const files = normalizeFiles(req);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Make sure you selected an image (max 5MB).',
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host') || ''}`.replace(/\/$/, '');

    const attachments = files.map((file: any) => {
      // Cloudinary: secure_url; disk: build URL from baseUrl + /uploads/ + filename
      let url: string | undefined = file.secure_url || file.url || file.path;
      if (url && typeof url === 'string' && !url.startsWith('http')) {
        url = `${baseUrl}/uploads/${file.filename || file.originalname}`;
      }
      const imageUrl = url || '';
      return {
        id: file.public_id || file.filename || file.originalname,
        thumbnail: imageUrl,
        original: imageUrl,
        file_name: file.originalname,
      };
    });

    return sendSuccess(res, 'Files uploaded successfully', attachments);
  });
}
