"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
exports.env = {
    // Server
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_URL: process.env.API_BASE_URL || '/api/v1',
    // Database
    MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || '',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || '',
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || '24h',
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '30d',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRE || '30d',
    JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30'),
    // Cloudinary (optional; used only for attachments if ATTACHMENT_STORAGE=cloudinary)
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    /** Attachments (hero slides, logos, etc.): 'disk' = local uploads/ folder (default). 'cloudinary' = Cloudinary. */
    ATTACHMENT_STORAGE: process.env.ATTACHMENT_STORAGE || 'disk',
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN ||
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
};
// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
