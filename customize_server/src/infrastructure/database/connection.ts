import mongoose from 'mongoose';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority' as any,
  autoIndex: env.NODE_ENV !== 'production',
};

const setupEventHandlers = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    retryCount = 0;
    logger.info('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
    isConnected = false;

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDatabase, RETRY_DELAY);
    } else {
      logger.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.');
      // throw new Error('Max reconnection attempts reached');
    }
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected');
    isConnected = false;

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDatabase, RETRY_DELAY);
    }
  });

  // SIGINT handler removed for serverless compatibility
};

export const connectDatabase = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('🟢 Using existing MongoDB connection');
    return;
  }

  if (!env.MONGO_URI) {
    logger.error('❌ MONGO_URI is not defined in environment variables');
    throw new Error('MONGO_URI is not defined');
  }

  try {
    logger.info('🔌 Attempting to connect to MongoDB...');

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const connectWithRetry = async (attempt = 1): Promise<void> => {
      try {
        await mongoose.connect(env.MONGO_URI, mongooseOptions);
        logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        isConnected = true;
        retryCount = 0;
      } catch (err: any) {
        if (attempt < MAX_RETRIES) {
          logger.info(
            `⏳ Connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return connectWithRetry(attempt + 1);
        }
        logger.error(`❌ Failed to connect to MongoDB after multiple attempts: ${err.message}`);
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
      }
    };

    setupEventHandlers();
    await connectWithRetry();
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit process, just log. The request will fail but the potential for recovery or better logging remains.
  }
};
