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
  max: env.NODE_ENV === 'development' ? 10000 : 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  next();
};

// Keep last
export { errorHandler };
