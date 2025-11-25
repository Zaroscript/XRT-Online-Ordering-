import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Minimal Swagger configuration for testing
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XRT Customized System API',
      version: '1.0.0',
      description: 'Enterprise-grade API for authentication and user management',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://xrt-online-ordering.vercel.app/api/v1'
          : 'http://localhost:3001/api/v1',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      }
    ],
  },
  apis: [], // Start with no API scanning to test basic functionality
};

let specs;

try {
  console.log('Creating minimal Swagger specification...');
  // Create a basic spec without scanning any files
  specs = {
    openapi: '3.0.0',
    info: {
      title: 'XRT Customized System API',
      version: '1.0.0',
      description: 'Enterprise-grade API for authentication and user management',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://xrt-online-ordering.vercel.app/api/v1'
          : 'http://localhost:3001/api/v1',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      }
    ],
    paths: {
      '/api/v1/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully'
            }
          }
        }
      },
      '/api/v1/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful'
            }
          }
        }
      }
    }
  };
  console.log('Minimal Swagger specification created successfully');
} catch (error) {
  console.error('Error creating minimal Swagger spec:', error);
  console.error('Error details:', error.stack);
  // Ultimate fallback
  specs = {
    openapi: '3.0.0',
    info: {
      title: 'XRT API',
      version: '1.0.0',
      description: 'API Documentation'
    },
    paths: {}
  };
}

export { swaggerUi, specs };
