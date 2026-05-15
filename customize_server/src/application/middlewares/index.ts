import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { env } from '../../shared/config/env';
import { errorHandler } from '../../shared/errors/errorHandler';

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Read origins from env (handles both variable names) and split them into an array
    const envString = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '';
    const envOrigins = envString.split(',').map(o => o.trim());

    // Failsafe: Always allow our core production domains
    const safeOrigins = [
      'https://xrttech.org',
      'https://www.xrttech.org',
      'https://admin.xrttech.org',
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    const isAllowed = envOrigins.includes(origin) || safeOrigins.includes(origin);

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      // Return false instead of throwing an Error to prevent breaking the preflight response
      callback(null, false); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-business-id', 'Accept'],
});

// Security middleware
export const securityMiddleware = [
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
  mongoSanitize(),
  hpp(),
];

// Compression
export const compressionMiddleware = compression();

// Rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  /**
   * Production defaults:
   * - GET-heavy dashboard pages can legitimately perform many reads.
   * - Keep stricter limits for non-GET without blocking normal browsing.
   */
  max: (req) => {
    if (env.NODE_ENV === 'development') return 10000;
    if (req.method === 'GET') return 600;
    return 120;
  },
  /**
   * Public menu reads are high-frequency and cache-friendly. They are already
   * guarded by infrastructure/network controls, so skip app-level limiter here
   * to avoid false 429s on storefront traffic.
   */
  skip: (req) => {
    const path = req.path || '';
    if (path === '/health') return true;
    if (path.startsWith('/api-docs')) return true;
    return (
      req.method === 'GET' &&
      /^\/api\/v\d+\/public\/(site-settings|testimonials|categories|products)$/.test(path)
    );
  },
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth brute-force protection for public auth endpoints
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 300 : 25,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive write endpoints (orders/payments/import save)
export const writeRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 500 : 40,
  message: 'Too many write requests. Please slow down and try again shortly.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  next();
};

// Keep last
export { errorHandler };
