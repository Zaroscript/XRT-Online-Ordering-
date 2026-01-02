"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const connection_1 = require("./infrastructure/database/connection");
const middlewares_1 = require("./application/middlewares");
const auth_routes_1 = __importDefault(require("./application/routes/auth.routes"));
const business_routes_1 = __importDefault(require("./application/routes/business.routes"));
const category_routes_1 = __importDefault(require("./application/routes/category.routes"));
const settings_routes_1 = __importDefault(require("./application/routes/settings.routes"));
const role_routes_1 = __importDefault(require("./application/routes/role.routes"));
const withdraw_routes_1 = __importDefault(require("./application/routes/withdraw.routes"));
const attachment_routes_1 = __importDefault(require("./application/routes/attachment.routes"));
const item_routes_1 = __importDefault(require("./application/routes/item.routes"));
const customer_routes_1 = __importDefault(require("./application/routes/customer.routes"));
const mock_routes_1 = __importDefault(require("./application/routes/mock.routes"));
const env_1 = require("./shared/config/env");
const logger_1 = require("./shared/utils/logger");
// Import swagger config - using relative path from src to config directory
const swagger_1 = require("../config/swagger");
const app = (0, express_1.default)();
// Database connection
(0, connection_1.connectDatabase)();
// Global middlewares
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use(middlewares_1.corsMiddleware);
app.use(middlewares_1.securityMiddleware);
app.use(middlewares_1.compressionMiddleware);
app.use(middlewares_1.rateLimitMiddleware);
app.use(middlewares_1.requestLogger);
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
            auth: `${env_1.env.API_BASE_URL}/auth`,
            businesses: `${env_1.env.API_BASE_URL}/businesses`,
            categories: `${env_1.env.API_BASE_URL}/admin/categories`,
            settings: `${env_1.env.API_BASE_URL}/settings`,
        },
        documentation: {
            swagger: '/api-docs',
            openApi: '/api-docs.json',
        },
        timestamp: new Date().toISOString(),
    });
});
// API Documentation (Swagger)
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'XRT API Documentation',
}));
// OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.specs);
});
// API Routes
app.use(`${env_1.env.API_BASE_URL}/auth`, auth_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/businesses`, business_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/categories`, category_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/settings`, settings_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/roles`, role_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/withdraws`, withdraw_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/attachments`, attachment_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/items`, item_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/customers`, customer_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}`, mock_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Error handler (must be last)
app.use(middlewares_1.errorHandler);
let server;
// Start server if not running on Vercel
if (!process.env.VERCEL) {
    const PORT = env_1.env.PORT;
    server = app.listen(PORT, () => {
        logger_1.logger.info(`🚀 Server running on port ${PORT}`);
        logger_1.logger.info(`📝 Environment: ${env_1.env.NODE_ENV}`);
        logger_1.logger.info(`📡 API available at http://localhost:${PORT}${env_1.env.API_BASE_URL}`);
    });
    // Handle port already in use error
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger_1.logger.error(`❌ Port ${PORT} is already in use!`);
            logger_1.logger.error(`💡 To fix this, run: lsof -ti:${PORT} | xargs kill -9`);
            logger_1.logger.error(`   Or manually kill the process using port ${PORT}`);
            process.exit(1);
        }
        else {
            logger_1.logger.error(`❌ Server error: ${err.message}`);
            throw err;
        }
    });
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION! 💥');
    logger_1.logger.error(`Error: ${err.name} - ${err.message}`);
    // Do not exit process in serverless environment
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! 💥');
    logger_1.logger.error(`Error: ${err.name} - ${err.message}`);
    // Do not exit process in serverless environment
});
exports.default = app;
