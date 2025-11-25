import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XRT Customized System API',
      version: '1.0.0',
      description: 'Enterprise-grade API for authentication, user management, and role-based access control',
      contact: {
        name: 'Development Team',
        email: 'dev@xrt.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development environment'
      },
      {
        url: 'https://api.xrt.com/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token for API authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
              description: 'User role'
            },
            customRole: {
              type: 'string',
              description: 'Custom role ID (if assigned)'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'User permissions'
            },
            isApproved: {
              type: 'boolean',
              description: 'Whether user account is approved'
            },
            isBanned: {
              type: 'boolean',
              description: 'Whether user account is banned'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user account is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Role ID'
            },
            name: {
              type: 'string',
              description: 'Role name (unique identifier)'
            },
            displayName: {
              type: 'string',
              description: 'Role display name'
            },
            description: {
              type: 'string',
              description: 'Role description'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Role permissions'
            },
            isSystem: {
              type: 'boolean',
              description: 'Whether this is a system role'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./controllers/*.js', './routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
