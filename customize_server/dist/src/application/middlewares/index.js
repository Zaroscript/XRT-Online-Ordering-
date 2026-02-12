"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestLogger = exports.rateLimitMiddleware = exports.compressionMiddleware = exports.securityMiddleware = exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../../shared/config/env");
const errorHandler_1 = require("../../shared/errors/errorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
// CORS configuration
exports.corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin)
            return callback(null, true);
        // Allow all origins in development
        if (env_1.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        // Check if allowedOrigins is defined and is an array
        if (!env_1.env.ALLOWED_ORIGINS ||
            !Array.isArray(env_1.env.ALLOWED_ORIGINS) ||
            env_1.env.ALLOWED_ORIGINS.length === 0) {
            // In production, if ALLOWED_ORIGINS is not set, we should probably still allow all or a default
            // to avoid breaking things, but it's better to log it.
            console.warn('CORS: env.ALLOWED_ORIGINS is not set properly, allowing all origins as fallback');
            return callback(null, true);
        }
        if (env_1.env.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
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
exports.securityMiddleware = [
    (0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
    (0, express_mongo_sanitize_1.default)(),
    (0, hpp_1.default)(),
];
// Compression
exports.compressionMiddleware = (0, compression_1.default)();
// Rate limiting
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'development' ? 10000 : 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
// Request logging (basic)
const requestLogger = (req, res, next) => {
    if (env_1.env.NODE_ENV === 'development') {
        console.log(`${req.method} ${req.path}`);
    }
    next();
};
exports.requestLogger = requestLogger;
