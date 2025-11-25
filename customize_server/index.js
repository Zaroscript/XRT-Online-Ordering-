import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import roleRoutes from './routes/roles.js';
import { connectDB } from './config/database.js';
import { allowedOrigins, API_BASE_URL } from './config/config.js';
import './config/passport.js';
import { swaggerUi, specs } from './config/swagger.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if allowedOrigins is defined and is an array
    if (!allowedOrigins || !Array.isArray(allowedOrigins)) {
      console.error('allowedOrigins is not properly configured:', allowedOrigins);
      return callback(null, true); // Allow all origins if config is broken
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))

// Database connection
connectDB().then(() => {
  console.log('✅ Database connection established');
}).catch(err => {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
});

// Routes
app.use(`${API_BASE_URL}/auth`, authRoutes);
app.use(`${API_BASE_URL}/roles`, roleRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Serve static files from public directory
app.use(express.static('public'));

// Custom Swagger UI route
app.get('/api-docs', (req, res) => {
  try {
    res.sendFile('public/swagger.html', { root: '.' });
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load API documentation interface'
    });
  }
});

// Test endpoint to check Swagger specs
app.get('/swagger-test', (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Swagger specs loaded successfully',
      hasSpecs: !!specs,
      specKeys: specs ? Object.keys(specs) : null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to test swagger specs',
      error: error.message
    });
  }
});

// Swagger JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  try {
    console.log('Generating Swagger JSON...');
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  } catch (error) {
    console.error('Error generating Swagger JSON:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate API documentation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API information endpoint
app.get('/api-info', (req, res) => {
  res.json({
    name: 'XRT Customized System API',
    version: '1.0.0',
    description: 'Enterprise authentication and user management system',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}${API_BASE_URL}/auth`,
      roles: `${req.protocol}://${req.get('host')}${API_BASE_URL}/roles`
    },
    features: [
      'JWT Authentication',
      'Role-Based Access Control',
      'User Management',
      'Permission System',
      'API Documentation'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle Swagger-related errors specifically
  if (req.path.startsWith('/api-docs') || req.path.startsWith('/swagger')) {
    return res.status(500).json({
      status: 'error',
      message: 'Swagger documentation error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Documentation temporarily unavailable'
    });
  }
  
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Don't shut down the server in development, just log the error
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Server will continue running');
    return;
  }
  
  server.close(() => {
    console.log('💀 Server shutting down due to unhandled rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Don't shut down the server in development, just log the error
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Server will continue running');
    return;
  }
  
  server.close(() => {
    console.log('💀 Server shutting down due to uncaught exception');
    process.exit(1);
  });
});