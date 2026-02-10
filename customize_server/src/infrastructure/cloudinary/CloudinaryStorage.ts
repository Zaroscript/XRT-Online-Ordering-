import { v2 as cloudinary } from 'cloudinary';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import { IImageStorage, ImageUploadResult } from '../../domain/services/IImageStorage';
import { env } from '../../shared/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const storage = createCloudinaryStorage({
  cloudinary: cloudinary,
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
    console.log(`[Cloudinary] Starting upload for ${file.originalname}`);
    if ((file as any).path) {
      return {
        url: (file as any).path,
        secure_url: (file as any).path,
        public_id: (file as any).filename,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'image',
        folder: folder ? (folder.startsWith('xrttech') ? folder : `xrttech/${folder}`) : 'xrttech',
      };

      const timeoutId = setTimeout(() => {
        console.error(`[Cloudinary] Upload timed out for ${file.originalname}`);
        reject(new Error('Cloudinary upload timed out'));
      }, 10000);

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        clearTimeout(timeoutId);
        if (error) {
          console.error(`[Cloudinary] Upload failed for ${file.originalname}:`, error);
          return reject(error);
        }

        if (!result) {
          console.error(`[Cloudinary] No result for ${file.originalname}`);
          return reject(new Error('Upload failed: No result from Cloudinary'));
        }

        console.log(`[Cloudinary] Upload success for ${file.originalname}: ${result.public_id}`);
        resolve({
          url: result.url,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      });

      stream.on('error', (err) => {
        clearTimeout(timeoutId);
        console.error(`[Cloudinary] Stream error for ${file.originalname}:`, err);
        reject(err);
      });

      stream.end(file.buffer);
    });
  }

  async deleteImage(public_id: string): Promise<void> {
    try {
      console.log(`[Cloudinary] Deleting image ${public_id}`);
      await cloudinary.uploader.destroy(public_id);
      console.log(`[Cloudinary] Deleted image ${public_id}`);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Do not throw error to avoid blocking flow
    }
  }
}
