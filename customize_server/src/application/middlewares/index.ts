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

    // Allow all origins in development
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check if allowedOrigins is defined and is an array
    if (
      !env.ALLOWED_ORIGINS ||
      !Array.isArray(env.ALLOWED_ORIGINS) ||
      env.ALLOWED_ORIGINS.length === 0
    ) {
      // In production, if ALLOWED_ORIGINS is not set, we should probably still allow all or a default
      // to avoid breaking things, but it's better to log it.
      console.warn(
        'CORS: env.ALLOWED_ORIGINS is not set properly, allowing all origins as fallback'
      );
      return callback(null, true);
    }

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      // In production, if we want to be safe but not break, we could return true here
      // but for now let's keep it strict if ALLOWED_ORIGINS is set.
      callback(new Error(`Not allowed by CORS: ${origin}`));
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
