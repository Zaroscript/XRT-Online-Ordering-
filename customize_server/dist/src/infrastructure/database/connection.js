"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../shared/config/env");
const logger_1 = require("../../shared/utils/logger");
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
    w: 'majority',
    autoIndex: env_1.env.NODE_ENV !== 'production',
};
const setupEventHandlers = () => {
    mongoose_1.default.connection.on('connected', () => {
        isConnected = true;
        retryCount = 0;
        logger_1.logger.info('✅ MongoDB connected successfully');
    });
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.logger.error(`❌ MongoDB connection error: ${err.message}`);
        isConnected = false;
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            logger_1.logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(exports.connectDatabase, RETRY_DELAY);
        }
        else {
            logger_1.logger.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.');
            // throw new Error('Max reconnection attempts reached');
        }
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.logger.warn('⚠️ MongoDB disconnected');
        isConnected = false;
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            logger_1.logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(exports.connectDatabase, RETRY_DELAY);
        }
    });
    // SIGINT handler removed for serverless compatibility
};
const connectDatabase = async () => {
    if (isConnected && mongoose_1.default.connection.readyState === 1) {
        logger_1.logger.info('🟢 Using existing MongoDB connection');
        return;
    }
    if (!env_1.env.MONGO_URI) {
        logger_1.logger.error('❌ MONGO_URI is not defined in environment variables');
        throw new Error('MONGO_URI is not defined');
    }
    try {
        logger_1.logger.info('🔌 Attempting to connect to MongoDB...');
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
        }
        const connectWithRetry = async (attempt = 1) => {
            try {
                await mongoose_1.default.connect(env_1.env.MONGO_URI, mongooseOptions);
                logger_1.logger.info(`✅ MongoDB Connected: ${mongoose_1.default.connection.host}`);
                isConnected = true;
                retryCount = 0;
            }
            catch (err) {
                if (attempt < MAX_RETRIES) {
                    logger_1.logger.info(`⏳ Connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                    return connectWithRetry(attempt + 1);
                }
                logger_1.logger.error(`❌ Failed to connect to MongoDB after multiple attempts: ${err.message}`);
                throw new Error(`Failed to connect to MongoDB: ${err.message}`);
            }
        };
        setupEventHandlers();
        await connectWithRetry();
    }
    catch (error) {
        logger_1.logger.error(`❌ MongoDB connection error: ${error.message}`);
        // Don't exit process, just log. The request will fail but the potential for recovery or better logging remains.
    }
};
exports.connectDatabase = connectDatabase;
