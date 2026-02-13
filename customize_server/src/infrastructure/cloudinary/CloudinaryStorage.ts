import { v2 as cloudinary } from 'cloudinary';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import { IImageStorage, ImageUploadResult } from '../../domain/services/IImageStorage';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';

if (env.CLOUDINARY_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const storage = createCloudinaryStorage({
  cloudinary,
  params: async (req: any, file: any) => {
    let folder = 'xrttech';

    // Check if section is explicitly passed in body
    let section = req.body?.section;

    if (!section) {
      // Attempt to parse the section from the URL
      // e.g., /api/v1/categories => categories
      // e.g., /api/v1/products => products
      // e.g., /api/v1/shops => shops
      const urlParts = req.baseUrl ? req.baseUrl.split('/') : [];
      // Usually url is like /api/v1/categories, so taking the last part is a good heuristic
      // If baseUrl is empty, try originalUrl
      const pathSegments = req.baseUrl
        ? req.baseUrl.split('/').filter(Boolean)
        : req.originalUrl
          ? req.originalUrl.split('/').filter(Boolean)
          : [];

      // Look for known entities or default to 'misc'
      const knownEntities = [
        'categories',
        'products',
        'shops',
        'coupons',
        'attributes',
        'groups',
        'tags',
        'users',
        'auth',
        'attachments',
        'settings',
      ];
      section = pathSegments.find((segment: string) => knownEntities.includes(segment)) || 'misc';
    }

    folder = `xrttech/${section}`;

    const businessId = req.body?.business_id || req.user?.business_id;
    if (businessId) {
      folder += `/${businessId}`;
    }

    // Check field name from body (passed from uploadClient) OR from file (multer native)
    const fieldName = req.body?.field || file.fieldname;

    if (fieldName === 'icon') {
      folder += '/icons';
    } else if (fieldName === 'gallery') {
      folder += '/gallery';
    } else if (typeof fieldName === 'string' && fieldName.includes('heroSlides')) {
      folder += '/hero-slides';
    }

    // Use 'auto' to let Cloudinary automatically detect the resource type
    // This works correctly for SVG files and other image types
    return {
      folder: folder,
      resource_type: 'image',
    };
  },
});

export class CloudinaryStorage implements IImageStorage {
  async uploadImage(file: Express.Multer.File, folder?: string): Promise<ImageUploadResult> {
    if (!env.CLOUDINARY_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env'
      );
    }
    if ((file as any).path) {
      return {
        url: (file as any).path,
        secure_url: (file as any).path,
        public_id: (file as any).filename,
      };
    }

    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      return Promise.reject(
        new Error('No file buffer. Ensure the request uses multipart/form-data and body parsing is skipped for this route.')
      );
    }

    logger.info('Cloudinary upload start:', file.originalname);
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'image',
        folder: folder ? (folder.startsWith('xrttech') ? folder : `xrttech/${folder}`) : 'xrttech',
      };

      const timeoutMs = 30000;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Cloudinary upload timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      const done = (err: Error | null, result?: any) => {
        clearTimeout(timeoutId);
        if (err) {
          logger.error('Cloudinary upload failed:', file.originalname, err.message);
          reject(err);
          return;
        }
        if (!result) {
          logger.error('Cloudinary upload: no result for', file.originalname);
          reject(new Error('Upload failed: No result from Cloudinary'));
          return;
        }
        logger.info('Cloudinary upload done:', file.originalname, result.public_id);
        resolve({
          url: result.url,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      };

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        done(error || null, result);
      });

      stream.on('error', (err) => {
        done(err);
      });

      stream.end(file.buffer);
    });
  }

  async deleteImage(public_id: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Do not throw error to avoid blocking flow
    }
  }
}
