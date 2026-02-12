import express, { Express } from 'express';
import path from 'path';
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
import publicRoutes from './application/routes/public.routes';
import roleRoutes from './application/routes/role.routes';
import withdrawRoutes from './application/routes/withdraw.routes';
import attachmentRoutes from './application/routes/attachment.routes';
import itemRoutes from './application/routes/item.routes';
import customerRoutes from './application/routes/customer.routes';
import mockRoutes from './application/routes/mock.routes';
import modifierGroupRoutes from './application/routes/modifier-group.routes';
import modifierRoutes from './application/routes/modifier.routes';
import itemSizeRoutes from './application/routes/item-size.routes';
import importRoutes from './application/routes/import.routes';
import permissionRoutes from './application/routes/permission.routes';
import priceRoutes from './application/routes/price.routes';
import kitchenSectionRoutes from './application/routes/kitchen-section.routes';
import taxRoutes from './application/routes/tax.routes';
import shippingRoutes from './application/routes/shipping.routes';
import couponRoutes from './application/routes/coupon.routes';
import testimonialRoutes from './application/routes/testimonial.routes';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
// Import swagger config - using relative path from src to config directory
import { specs } from './swagger';

const app: Express = express();
// Trigger restart for helmet config change

// Database connection
// Database connection will be established in startServer function

// Global middlewares
// Skip body parsing for attachments and import routes so Multer can handle multipart/form-data
const skipBodyParsing = (req: express.Request) =>
  req.path.startsWith('/attachments') ||
  req.originalUrl.includes('/attachments') ||
  req.path.startsWith('/import') ||
  req.originalUrl.includes('/import');

app.use((req, res, next) => {
  if (skipBodyParsing(req)) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (skipBodyParsing(req)) {
    return next();
  }
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});
app.use(cookieParser());
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(requestLogger);

// Serve uploaded files (when using disk storage for attachments)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
      categories: `${env.API_BASE_URL}/categories`,
      items: `${env.API_BASE_URL}/items`,
      itemSizes: `${env.API_BASE_URL}/items/{itemId}/sizes`,
      modifierGroups: `${env.API_BASE_URL}/modifier-groups`,
      modifiers: `${env.API_BASE_URL}/modifier-groups/{groupId}/modifiers`,
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
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'XRT API Documentation',
  })
);

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
app.use(`${env.API_BASE_URL}/public`, publicRoutes);
app.use(`${env.API_BASE_URL}/roles`, roleRoutes);
app.use(`${env.API_BASE_URL}/permissions`, permissionRoutes);
app.use(`${env.API_BASE_URL}/withdraws`, withdrawRoutes);
app.use(
  `${env.API_BASE_URL}/attachments`,
  (req, res, next) => {
    next();
  },
  attachmentRoutes
);
app.use(`${env.API_BASE_URL}/items`, itemRoutes);
app.use(`${env.API_BASE_URL}/sizes`, itemSizeRoutes); // Nested routes for item sizes
app.use(`${env.API_BASE_URL}/customers`, customerRoutes);
app.use(`${env.API_BASE_URL}/modifier-groups`, modifierGroupRoutes);
app.use(`${env.API_BASE_URL}/import`, importRoutes);
app.use(`${env.API_BASE_URL}/kitchen-sections`, kitchenSectionRoutes);
app.use(`${env.API_BASE_URL}`, modifierRoutes);
app.use(`${env.API_BASE_URL}/prices`, priceRoutes);
app.use(`${env.API_BASE_URL}`, mockRoutes);
app.use(`${env.API_BASE_URL}/taxes`, taxRoutes);
app.use(`${env.API_BASE_URL}/shippings`, shippingRoutes);
app.use(`${env.API_BASE_URL}/coupons`, couponRoutes);
app.use(`${env.API_BASE_URL}/testimonials`, testimonialRoutes);

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

const startServer = async () => {
  try {
    await connectDatabase();

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
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

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
