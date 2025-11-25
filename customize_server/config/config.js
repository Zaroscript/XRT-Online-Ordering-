import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Export configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3001;
export const API_BASE_URL = process.env.API_BASE_URL || '/api/v1';
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '15m';
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
export const JWT_COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE) || 30;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 100; // limit each IP to 100 requests per windowMs

// CORS
export const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ['http://localhost:3000', 'http://localhost:3001'];

// Security
export const SECURE_COOKIES = NODE_ENV === 'production';
export const TRUST_PROXY = NODE_ENV === 'production' ? 1 : 0;