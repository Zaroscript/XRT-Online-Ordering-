import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ItemModel } from '../src/infrastructure/database/models/ItemModel';
import { env } from '../src/shared/config/env';

async function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {
            reject(new Error(`Failed to download ${url}. Status code: ${response.statusCode}`));
          });
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {
          reject(err);
        });
      });
  });
}

function getUploadsBaseUrl(): string {
  // Public base URL where uploads are served from customize_server
  // Default: http://localhost:<PORT>
  const port = env.PORT || 3001;
  const host =
    process.env.UPLOADS_BASE_URL ||
    `http://localhost:${port}`;
  return host.replace(/\/$/, '');
}

async function migrateItemImages(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadsBaseUrl = getUploadsBaseUrl();
    const cloudinaryRegex = /res\.cloudinary\.com/i;
    const items = await ItemModel.find({
      $or: [
        { image: cloudinaryRegex },
        { image: /^\/uploads\//i }, // previously migrated as relative paths
      ],
    });

    if (!items.length) {
      console.log('No items found needing image migration. Nothing to do.');
      return;
    }

    console.log(`Found ${items.length} items with Cloudinary or relative /uploads images. Starting migration...`);

    for (const item of items) {
      const imageUrl: string | undefined = (item as any).image;
      if (!imageUrl) continue;

      // Case 1: relative /uploads path -> just normalize to absolute URL
      if (imageUrl.startsWith('/uploads/')) {
        const filename = imageUrl.split('/').pop() || imageUrl.replace('/uploads/', '');
        (item as any).image = `${uploadsBaseUrl}/uploads/${filename}`;
        (item as any).image_public_id = filename;
        await item.save();
        console.log(`✅ Normalized item ${item._id} image to ${uploadsBaseUrl}/uploads/${filename}`);
        continue;
      }

      // Case 2: Cloudinary URL -> download then point to local uploads URL
      if (cloudinaryRegex.test(imageUrl)) {
        try {
          const urlObj = new URL(imageUrl);
          const urlPath = urlObj.pathname || '';
          const urlName = urlPath.split('/').pop() || '';
          const urlExt = path.extname(urlName) || '.jpg';

          const publicId: string =
            (item as any).image_public_id ||
            urlName.replace(urlExt, '') ||
            item._id.toString();

          const safeBase = publicId.split('/').pop() || publicId;
          const filename = `${safeBase}${urlExt}`;
          const destPath = path.join(uploadsDir, filename);

          console.log(`➡️  Migrating item ${item._id} image from Cloudinary to ${destPath}`);

          // Download the image to local uploads folder
          await downloadImage(imageUrl, destPath);

          (item as any).image = `${uploadsBaseUrl}/uploads/${filename}`;
          (item as any).image_public_id = filename;
          await item.save();

          console.log(`✅ Migrated item ${item._id} image to ${uploadsBaseUrl}/uploads/${filename}`);
        } catch (err) {
          console.error(`❌ Failed to migrate image for item ${item._id}:`, err);
        }
      }
    }

    console.log('🎉 Item image migration completed.');
  } catch (error) {
    console.error('❌ Error during item image migration:', error);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

migrateItemImages();

