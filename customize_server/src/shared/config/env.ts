import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const env = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || '/api/v1',
  /** Public base URL for disk upload links (e.g. https://api.example.com). Set when behind a proxy so /uploads/* URLs work. */
  PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN || process.env.API_PUBLIC_ORIGIN || '',

  // Database
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || '',
  ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || '24h',
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30'),

  // Cloudinary – used for all image uploads (items, categories, attachments) when configured
  CLOUDINARY_NAME: (process.env.CLOUDINARY_NAME || '').trim(),
  CLOUDINARY_API_KEY: (process.env.CLOUDINARY_API_KEY || '').trim(),
  CLOUDINARY_API_SECRET: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  ATTACHMENT_STORAGE:
    (process.env.ATTACHMENT_STORAGE || '').trim() === 'disk'
      ? 'disk'
      : (process.env.CLOUDINARY_NAME || '').trim()
        ? 'cloudinary'
        : 'disk',

  // CORS
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,http://localhost:8000',
  ALLOWED_ORIGINS: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173',
        'http://localhost:8000',
      ],

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || '',
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || '',

  // Security
  SECURE_COOKIES: process.env.NODE_ENV === 'production',
  TRUST_PROXY: process.env.NODE_ENV === 'production' ? 1 : 0,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
} as const;

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
