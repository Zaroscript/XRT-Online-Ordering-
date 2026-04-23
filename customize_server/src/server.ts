import http from 'http';
import express, { Express } from 'express';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './infrastructure/database/connection';
import {
  corsMiddleware,
  securityMiddleware,
  compressionMiddleware,
  rateLimitMiddleware,
  authRateLimitMiddleware,
  requestLogger,
  errorHandler,
} from './application/middlewares';
import authRoutes from './application/routes/auth.routes';
import businessRoutes from './application/routes/business.routes';
import categoryRoutes from './application/routes/category.routes';
import settingsRoutes from './application/routes/settings.routes';
import publicRoutes from './application/routes/public.routes';
import roleRoutes from './application/routes/role.routes';
import attachmentRoutes from './application/routes/attachment.routes';
import itemRoutes from './application/routes/item.routes';
import customerRoutes from './application/routes/customer.routes';
import mockRoutes from './application/routes/mock.routes';
import modifierGroupRoutes from './application/routes/modifier-group.routes';
import modifierRoutes from './application/routes/modifier.routes';
import itemSizeRoutes from './application/routes/item-size.routes';
import importRoutes from './application/routes/import.routes';
import exportRoutes from './application/routes/export.routes';
import permissionRoutes from './application/routes/permission.routes';
import priceRoutes from './application/routes/price.routes';
import kitchenSectionRoutes from './application/routes/kitchen-section.routes';
import taxRoutes from './application/routes/tax.routes';
import shippingRoutes from './application/routes/shipping.routes';
import couponRoutes from './application/routes/coupon.routes';
import testimonialRoutes from './application/routes/testimonial.routes';
import orderRoutes from './application/routes/order.routes';
import templateRoutes from './application/routes/template.routes';
import printerRoutes from './application/routes/printer.routes';
import printerLogRoutes from './application/routes/printer-log.routes';
import printJobRoutes from './application/routes/print-job.routes';
import transactionRoutes from './application/routes/transaction.routes';
import analyticsRoutes from './application/routes/analytics.routes';
import emailCampaignRoutes from './application/routes/email-campaign.routes';
import smsCampaignRoutes from './application/routes/sms-campaign.routes';
import loyaltyRoutes from './application/routes/loyalty.routes';
import webhookRoutes from './application/routes/webhook.routes';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
import { registerOrderPrintHandler } from './services/printer/orderPrintEvents';
import { startPrinterStatusMonitor } from './services/printer/printerStatusMonitor';
// Import swagger config - using relative path from src to config directory
import { specs } from './swagger';
import { autoOrderManager } from './services/order/AutoOrderManagerService';

const app: Express = express();
// Trigger restart for helmet config change
// Trust the Nginx reverse proxy
app.set('trust proxy', 1);
// Database connection
// Database connection will be established in startServer function

// Global middlewares
// Skip body parsing for any route that accepts multipart/form-data (multer) 
// UNLESS it's a JSON request (like sort-order).
const skipBodyParsing = (req: express.Request) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  
  // NEVER skip body parsing if it's application/json
  if (contentType.includes('application/json')) {
    return false;
  }

  // Only skip for specific paths known to handle multipart/form-data
  const path = req.path.toLowerCase();
  const url = req.originalUrl.toLowerCase();
  
  return (
    path.includes('/attachments') ||
    url.includes('/attachments') ||
    path.includes('/import') ||
    url.includes('/import') ||
    path.includes('/items') ||
    url.includes('/items') ||
    path.includes('/categories') ||
    url.includes('/categories')
  );
};

app.use((req, res, next) => {
  const shouldSkip = skipBodyParsing(req);
  if (shouldSkip) {
    console.log(`⏩ Skipping body parsing for: ${req.method} ${req.originalUrl}`);
    return next();
  }
  console.log(`🔍 Parsing body for: ${req.method} ${req.originalUrl} (${req.headers['content-type']})`);
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

// Middleware to ensure database connection in serverless environment
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await connectDatabase();
      next();
    } catch (error) {
      logger.error('Database connection failed in middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
      return; // Ensure no further processing
    }
  } else {
    next();
  }
});

// API Routes
app.use(`${env.API_BASE_URL}/auth`, authRateLimitMiddleware, authRoutes);
app.use(`${env.API_BASE_URL}/businesses`, businessRoutes);
app.use(`${env.API_BASE_URL}/categories`, categoryRoutes);
app.use(`${env.API_BASE_URL}/settings`, settingsRoutes);
app.use(`${env.API_BASE_URL}/public`, publicRoutes);
app.use(`${env.API_BASE_URL}/roles`, roleRoutes);
app.use(`${env.API_BASE_URL}/permissions`, permissionRoutes);
app.use(`${env.API_BASE_URL}/attachments`, attachmentRoutes);
app.use(`${env.API_BASE_URL}/items`, itemRoutes);
app.use(`${env.API_BASE_URL}/sizes`, itemSizeRoutes); // Nested routes for item sizes
app.use(`${env.API_BASE_URL}/customers`, customerRoutes);
app.use(`${env.API_BASE_URL}/modifier-groups`, modifierGroupRoutes);
app.use(`${env.API_BASE_URL}/import`, importRoutes);
app.use(`${env.API_BASE_URL}/export`, exportRoutes);
app.use(`${env.API_BASE_URL}/kitchen-sections`, kitchenSectionRoutes);
app.use(`${env.API_BASE_URL}`, modifierRoutes);
app.use(`${env.API_BASE_URL}/prices`, priceRoutes);
app.use(`${env.API_BASE_URL}`, mockRoutes);
app.use(`${env.API_BASE_URL}/taxes`, taxRoutes);
app.use(`${env.API_BASE_URL}/shippings`, shippingRoutes);
app.use(`${env.API_BASE_URL}/coupons`, couponRoutes);
app.use(`${env.API_BASE_URL}/testimonials`, testimonialRoutes);
app.use(`${env.API_BASE_URL}/orders`, orderRoutes);
app.use(`${env.API_BASE_URL}/templates`, templateRoutes);
app.use(`${env.API_BASE_URL}/printers`, printerRoutes);
app.use(`${env.API_BASE_URL}/printer-logs`, printerLogRoutes);
app.use(`${env.API_BASE_URL}/print-jobs`, printJobRoutes);
app.use(`${env.API_BASE_URL}/transactions`, transactionRoutes);
app.use(`${env.API_BASE_URL}/analytics`, analyticsRoutes);
app.use(`${env.API_BASE_URL}/email-campaigns`, emailCampaignRoutes);
app.use(`${env.API_BASE_URL}/sms-campaigns`, smsCampaignRoutes);
app.use(`${env.API_BASE_URL}/loyalty`, loyaltyRoutes);

// Webhook routes — PUBLIC, no auth required (signature-verified internally)
app.use(`${env.API_BASE_URL}/webhooks`, webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

let server: http.Server | null = null;
let io: SocketIOServer | null = null;

const getSocketAllowedOrigins = (): string[] => {
  const configured = env.ALLOWED_ORIGINS.filter(Boolean);
  const productionDefaults = ['https://xrttech.org', 'https://www.xrttech.org', 'https://admin.xrttech.org'];
  return Array.from(new Set([...configured, ...productionDefaults]));
};

const startServer = async () => {
  try {
    await connectDatabase();

    // Start server only if not running on Vercel
    if (!process.env.VERCEL) {
      const PORT = env.PORT;
      server = http.createServer(app);
      const socketAllowedOrigins =
        env.NODE_ENV === 'development' ? true : getSocketAllowedOrigins();
      io = new SocketIOServer(server, {
        cors: { origin: socketAllowedOrigins, methods: ['GET', 'POST'] },
        pingTimeout: 60000,
        pingInterval: 25000,
      });
      app.set('io', io);

      io.on('connection', (socket) => {
        socket.on('join', (userId: string) => {
          if (userId) socket.join(userId);
        });
      });

      registerOrderPrintHandler();
      startPrinterStatusMonitor(io, 30_000);
      autoOrderManager.start();

      server.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📝 Environment: ${env.NODE_ENV}`);
        logger.info(`📡 API available at http://localhost:${PORT}${env.API_BASE_URL}`);
        logger.info(`🔌 Socket.io attached for real-time events`);
        if (env.ATTACHMENT_STORAGE === 'cloudinary' && env.CLOUDINARY_NAME) {
          logger.info(`☁️ Image uploads: Cloudinary (${env.CLOUDINARY_NAME})`);
        } else {
          logger.info(
            `📁 Image uploads: disk (set CLOUDINARY_* + ATTACHMENT_STORAGE=cloudinary for Cloudinary)`
          );
        }
      });

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
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

if (!process.env.VERCEL) {
  startServer();
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
