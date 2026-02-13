import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

import { storage as cloudinaryStorage } from '../../infrastructure/cloudinary/CloudinaryStorage';
import { env } from '../../shared/config/env';

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const memoryStorage = multer.memoryStorage();

// Local disk for attachments when not using Cloudinary. Vercel FS is read-only so we use tmp or skip.
const uploadsDir = process.env.VERCEL
  ? path.join(process.cwd(), 'tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  // mkdir can fail on read-only FS; we fall back to memory/cloudinary below.
}

const useDiskStorage = env.ATTACHMENT_STORAGE !== 'cloudinary' && !process.env.VERCEL;

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${unique}${ext}`);
  },
});

const attachmentStorage =
  env.ATTACHMENT_STORAGE === 'cloudinary'
    ? cloudinaryStorage
    : useDiskStorage
      ? diskStorage
      : memoryStorage;

export const uploadImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadAttachment = multer({
  storage: attachmentStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// CSV/ZIP imports: keep in memory

const importFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow CSV and ZIP files
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/csv' ||
    file.mimetype === 'application/zip' ||
    file.originalname.endsWith('.csv') ||
    file.originalname.endsWith('.zip')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV or ZIP files are allowed for imports'));
  }
};

export const upload = multer({
  storage: memoryStorage,
  fileFilter: importFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for imports
  },
});
