import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { MONGODB_URI, NODE_ENV } from './config.js';

// Keep track of connection status
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  autoIndex: NODE_ENV !== 'production',
};

// Handle connection events
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
      setTimeout(connectDB, RETRY_DELAY);
    } else {
      logger.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.');
      process.exit(1);
    }
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected');
    isConnected = false;
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDB, RETRY_DELAY);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      logger.info('🔴 MongoDB connection closed (App terminated)');
      process.exit(0);
    } catch (err) {
      logger.error(`Error closing MongoDB connection: ${err.message}`);
      process.exit(1);
    }
  });
};

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('🟢 Using existing MongoDB connection');
    return mongoose;
  }

  if (!MONGODB_URI) {
    logger.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    logger.info('🔌 Attempting to connect to MongoDB...');
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const connectWithRetry = async (attempt = 1) => {
      try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        isConnected = true;
        retryCount = 0;
        return mongoose;
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          logger.info(`⏳ Connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return connectWithRetry(attempt + 1);
        }
        logger.error(`❌ Failed to connect to MongoDB after multiple attempts: ${err.message}`);
        process.exit(1);
      }
    };

    setupEventHandlers();
    return await connectWithRetry();
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export { connectDB };