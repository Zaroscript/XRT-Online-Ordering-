import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './infrastructure/database/connection';
import {
  corsMiddleware,
  securityMiddleware,
  compressionMiddleware,
  rateLimitMiddleware,
  requestLogger,
  errorHandler,
} from './application/middlewares';
import authRoutes from './application/routes/auth.routes';
import businessRoutes from './application/routes/business.routes';
import categoryRoutes from './application/routes/category.routes';
import settingsRoutes from './application/routes/settings.routes';
import roleRoutes from './application/routes/role.routes';
import withdrawRoutes from './application/routes/withdraw.routes';
import attachmentRoutes from './application/routes/attachment.routes';
import itemRoutes from './application/routes/item.routes';
import customerRoutes from './application/routes/customer.routes';
import mockRoutes from './application/routes/mock.routes';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
// Import swagger config - using relative path from src to config directory
import { specs } from '../config/swagger';

const app: Express = express();

// Database connection
connectDatabase();

// Global middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'XRT Customized System API',
    version: '1.0.0',
    endpoints: {
      auth: `${env.API_BASE_URL}/auth`,
      businesses: `${env.API_BASE_URL}/businesses`,
      categories: `${env.API_BASE_URL}/admin/categories`,
      settings: `${env.API_BASE_URL}/settings`,
    },
    documentation: {
      swagger: '/api-docs',
      openApi: '/api-docs.json',
    },
    timestamp: new Date().toISOString(),
  });
});

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'XRT API Documentation',
}));

// OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// API Routes
app.use(`${env.API_BASE_URL}/auth`, authRoutes);
app.use(`${env.API_BASE_URL}/businesses`, businessRoutes);
app.use(`${env.API_BASE_URL}/categories`, categoryRoutes);
app.use(`${env.API_BASE_URL}/settings`, settingsRoutes);
app.use(`${env.API_BASE_URL}/roles`, roleRoutes);
app.use(`${env.API_BASE_URL}/withdraws`, withdrawRoutes);
app.use(`${env.API_BASE_URL}/attachments`, attachmentRoutes);
app.use(`${env.API_BASE_URL}/items`, itemRoutes);
app.use(`${env.API_BASE_URL}/customers`, customerRoutes);
app.use(`${env.API_BASE_URL}`, mockRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

let server: any;

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  const PORT = env.PORT;
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${env.NODE_ENV}`);
    logger.info(`📡 API available at http://localhost:${PORT}${env.API_BASE_URL}`);
  });

  // Handle port already in use error
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use!`);
      logger.error(`💡 To fix this, run: lsof -ti:${PORT} | xargs kill -9`);
      logger.error(`   Or manually kill the process using port ${PORT}`);
      process.exit(1);
    } else {
      logger.error(`❌ Server error: ${err.message}`);
      throw err;
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥');
  logger.error(`Error: ${err.name} - ${err.message}`);
  // Do not exit process in serverless environment
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥');
  logger.error(`Error: ${err.name} - ${err.message}`);
  // Do not exit process in serverless environment
});

export default app;

