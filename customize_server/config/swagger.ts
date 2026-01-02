// Static Swagger configuration - no external libraries
import { env } from '../src/shared/config/env.js';

export const specs = {
  openapi: '3.0.0',
  info: {
    title: 'XRT Customized System API',
    version: '2.0.0',
    description: `Enterprise-grade REST API built with Clean Architecture, TypeScript, and Node.js + Express + MongoDB.

## Architecture
This API follows Clean Architecture principles with strict separation of concerns:
- **Domain Layer**: Business logic (framework-agnostic)
- **Application Layer**: Express controllers, routes, and middlewares
- **Infrastructure Layer**: Database, external services, and implementations
- **Shared Layer**: Utilities, constants, and configuration

## Features
- 🔐 JWT Authentication with access & refresh tokens
- 👥 Complete User Management with RBAC
- 🏢 Multi-Business Support
- 📦 Category Management
- 🎭 Role-Based Access Control (RBAC)
- 🔒 Enterprise Security Features
- 📚 Comprehensive API Documentation

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`Authorization: Bearer YOUR_ACCESS_TOKEN\`

## Response Format
All responses follow a consistent format:
- Success: \`{ "success": true, "message": "...", "data": {...} }\`
- Error: \`{ "success": false, "message": "Error description" }\``,
    contact: {
      name: 'API Support',
      email: 'support@xrt.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: process.env.PRODUCTION_URL || `https://xrt-online-ordering.vercel.app${env.API_BASE_URL}`,
      description: 'Production',
    },
    {
      url: `http://localhost:${env.PORT}${env.API_BASE_URL}`,
      description: 'Development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: {
            type: 'string',
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            example: 'client',
          },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create'],
          },
          isApproved: { type: 'boolean', example: true },
          isBanned: { type: 'boolean', example: false },
          banReason: { type: 'string', example: null },
          customRole: { type: 'string', example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'content-manager' },
          displayName: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Can manage content but not users' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update'],
          },
          isSystem: { type: 'boolean', example: false },
          createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { type: 'object' },
              },
              paginatorInfo: {
                type: 'object',
                properties: {
                  total: { type: 'integer', example: 100 },
                  currentPage: { type: 'integer', example: 1 },
                  lastPage: { type: 'integer', example: 10 },
                  perPage: { type: 'integer', example: 10 },
                  count: { type: 'integer', example: 10 },
                },
              },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Pizza' },
          description: { type: 'string', example: 'Delicious pizza category' },
          image: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              original: { type: 'string' },
              thumbnail: { type: 'string' },
            },
          },
          business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          isActive: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Item: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Margherita Pizza' },
          description: { type: 'string', example: 'Classic cheese pizza' },
          sort_order: { type: 'integer', example: 1 },
          is_active: { type: 'boolean', example: true },
          base_price: { type: 'number', example: 12.99 },
          category_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          image: { type: 'string', example: 'https://cloudinary.com/item.jpg' },
          is_available: { type: 'boolean', example: true },
          is_signature: { type: 'boolean', example: false },
          max_per_order: { type: 'integer', example: 10 },
          is_sizeable: { type: 'boolean', example: false },
          is_customizable: { type: 'boolean', example: false },
          sizes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Large' },
                price: { type: 'number', example: 2.50 },
                is_default: { type: 'boolean', example: false },
              },
            },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Customer: {
        type: 'object',
        required: ['name', 'email', 'phoneNumber'],
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          phoneNumber: { type: 'string', example: '+1234567890' },
          business_id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'Automatically set from current user\'s business' },
          rewards: { type: 'number', example: 150 },
          isActive: { type: 'boolean', example: true },
          last_order_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
          preferences: {
            type: 'object',
            properties: {
              dietary: {
                type: 'array',
                items: { type: 'string' },
                example: ['vegetarian'],
              },
              allergies: {
                type: 'array',
                items: { type: 'string' },
                example: ['nuts'],
              },
              favoriteItems: {
                type: 'array',
                items: { type: 'string' },
                example: ['Pizza', 'Burger'],
              },
              specialInstructions: { type: 'string', example: 'No onions please' },
            },
          },
          addresses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['home', 'work', 'other'], example: 'home' },
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
                isDefault: { type: 'boolean', example: true },
              },
            },
          },
          loyaltyTier: {
            type: 'string',
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            example: 'silver',
          },
          totalOrders: { type: 'number', example: 25 },
          totalSpent: { type: 'number', example: 1250.5 },
          notes: { type: 'string', example: 'VIP customer, prefers delivery' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Business: {
        type: 'object',
        required: [
          'id',
          'owner',
          'name',
          'legal_name',
          'primary_content_name',
          'primary_content_email',
          'primary_content_phone',
        ],
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          id: {
            type: 'string',
            example: 'biz-123456789',
            description: 'Business unique identifier',
          },
          owner: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Reference to user who owns the business',
          },
          name: {
            type: 'string',
            example: "Joe's Pizza Place",
            description: 'Business display name',
          },
          legal_name: {
            type: 'string',
            example: "Joe's Pizza LLC",
            description: 'Legal business registration name',
          },
          primary_content_name: {
            type: 'string',
            example: 'Joe Smith',
            description: 'Primary contact person name',
          },
          primary_content_email: {
            type: 'string',
            format: 'email',
            example: 'joe@joespizza.com',
            description: 'Primary contact email',
          },
          primary_content_phone: {
            type: 'string',
            example: '+1234567890',
            description: 'Primary contact phone number',
          },
          isActive: { type: 'boolean', example: true, description: 'Business active status' },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Business creation timestamp',
          },
          description: {
            type: 'string',
            example: 'Best pizza in town!',
            description: 'Business description',
          },
          website: {
            type: 'string',
            example: 'https://joespizza.com',
            description: 'Business website URL',
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Main St' },
              city: { type: 'string', example: 'New York' },
              state: { type: 'string', example: 'NY' },
              zipCode: { type: 'string', example: '10001' },
              country: { type: 'string', example: 'USA' },
            },
          },
          logo: {
            type: 'string',
            example: 'https://joespizza.com/logo.png',
            description: 'Business logo URL',
          },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'Point' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                example: [-73.935242, 40.73061],
              },
            },
          },
          google_maps_verification: { type: 'boolean', example: false },
          social_media: {
            type: 'object',
            properties: {
              facebook: { type: 'string' },
              instagram: { type: 'string' },
              whatsapp: { type: 'string' },
              tiktok: { type: 'string' },
            },
          },
          header_info: { type: 'string' },
          footer_text: { type: 'string' },
          messages: {
            type: 'object',
            properties: {
              closed_message: { type: 'string' },
              not_accepting_orders_message: { type: 'string' },
            },
          },
          timezone: { type: 'string', example: 'America/New_York' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateBusinessRequest: {
        type: 'object',
        required: [
          'owner',
          'name',
          'legal_name',
          'primary_content_name',
          'primary_content_email',
          'primary_content_phone',
        ],
        properties: {
          owner: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'User ID of the business owner',
          },
          name: {
            type: 'string',
            example: "Joe's Pizza Place",
            description: 'Business display name',
          },
          legal_name: {
            type: 'string',
            example: "Joe's Pizza LLC",
            description: 'Legal business name',
          },
          primary_content_name: {
            type: 'string',
            example: 'Joe Smith',
            description: 'Primary contact name',
          },
          primary_content_email: {
            type: 'string',
            format: 'email',
            example: 'joe@joespizza.com',
            description: 'Primary contact email',
          },
          primary_content_phone: {
            type: 'string',
            example: '+1234567890',
            description: 'Primary contact phone',
          },
          description: {
            type: 'string',
            example: 'Best pizza in town!',
            description: 'Business description',
          },
          website: {
            type: 'string',
            example: 'https://joespizza.com',
            description: 'Business website',
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          logo: { type: 'string', description: 'Business logo URL' },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'Point' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                example: [-73.935242, 40.73061],
              },
            },
          },
          google_maps_verification: { type: 'boolean', example: false },
          social_media: {
            type: 'object',
            properties: {
              facebook: { type: 'string' },
              instagram: { type: 'string' },
              whatsapp: { type: 'string' },
              tiktok: { type: 'string' },
            },
          },
          header_info: { type: 'string' },
          footer_text: { type: 'string' },
          messages: {
            type: 'object',
            properties: {
              closed_message: { type: 'string' },
              not_accepting_orders_message: { type: 'string' },
            },
          },
          timezone: { type: 'string', example: 'America/New_York' },
        },
      },
      UpdateBusinessRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Business display name' },
          legal_name: { type: 'string', description: 'Legal business name' },
          primary_content_name: { type: 'string', description: 'Primary contact name' },
          primary_content_email: {
            type: 'string',
            format: 'email',
            description: 'Primary contact email',
          },
          primary_content_phone: { type: 'string', description: 'Primary contact phone' },
          description: { type: 'string', description: 'Business description' },
          website: { type: 'string', description: 'Business website' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
          },
          logo: { type: 'string', description: 'Business logo URL' },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'Point' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                example: [-73.935242, 40.73061],
              },
            },
          },
          google_maps_verification: { type: 'boolean', example: false },
          social_media: {
            type: 'object',
            properties: {
              facebook: { type: 'string' },
              instagram: { type: 'string' },
              whatsapp: { type: 'string' },
              tiktok: { type: 'string' },
            },
          },
          header_info: { type: 'string' },
          footer_text: { type: 'string' },
          messages: {
            type: 'object',
            properties: {
              closed_message: { type: 'string' },
              not_accepting_orders_message: { type: 'string' },
            },
          },
          timezone: { type: 'string', example: 'America/New_York' },
          isActive: { type: 'boolean', description: 'Business active status' },
        },
      },
      UpdateBusinessOwnerRequest: {
        type: 'object',
        required: ['ownerId'],
        properties: {
          ownerId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'New owner user ID',
          },
        },
      },
      BusinessSettings: {
        type: 'object',
        properties: {
          business: { type: 'string', description: 'Business ID' },
          operating_hours: {
            type: 'object',
            properties: {
              auto_close: { type: 'boolean' },
              schedule: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string' },
                    open_time: { type: 'string' },
                    close_time: { type: 'string' },
                    is_closed: { type: 'boolean' },
                  },
                },
              },
            },
          },
          delivery: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              radius: { type: 'number', description: 'Delivery radius in miles' },
              fee: { type: 'number' },
              min_order: { type: 'number' },
            },
          },
          fees: {
            type: 'object',
            properties: {
              service_fee: { type: 'number' },
              tip: { type: 'number' },
              tip_type: { type: 'string', enum: ['fixed', 'percentage'] },
            },
          },
          taxes: {
            type: 'object',
            properties: {
              sales_tax: { type: 'number' },
            },
          },
          orders: {
            properties: {
              accept_orders: { type: 'boolean' },
              allowScheduleOrder: { type: 'boolean' },
              maxDays: { type: 'number' },
              deliveredOrderTime: { type: 'number' },
            },
          },
          siteTitle: { type: 'string' },
          siteSubtitle: { type: 'string' },
          currency: { type: 'string' },
          seo: {
            type: 'object',
            properties: {
              metaTitle: { type: 'string' },
              metaDescription: { type: 'string' },
              ogTitle: { type: 'string' },
              ogDescription: { type: 'string' },
              ogImage: { type: 'object' },
              twitterHandle: { type: 'string' },
              twitterCardType: { type: 'string' },
              metaTags: { type: 'string' },
              canonicalUrl: { type: 'string' },
            },
          },
          logo: { type: 'object' },
          contactDetails: {
            type: 'object',
            properties: {
              location: { type: 'object' },
              contact: { type: 'string' },
              contacts: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              website: { type: 'string' },
              socials: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    icon: { type: 'string' },
                    url: { type: 'string' }
                  }
                }
              }
            }
          },
          heroSlides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bgImage: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    original: { type: 'string' },
                    thumbnail: { type: 'string' },
                  },
                },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                btnText: { type: 'string' },
                btnLink: { type: 'string' },
              },
            },
          },
          // header_info removed
          footer_text: { type: 'string' },
          messages: {
            type: 'object',
            properties: {
              closed_message: { type: 'string' },
              not_accepting_orders_message: { type: 'string' },
            },
          },
          isUnderMaintenance: { type: 'boolean', default: false },
          maintenance: {
            type: 'object',
            properties: {
              image: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  original: { type: 'string' },
                  thumbnail: { type: 'string' },
                },
              },
              title: { type: 'string', default: '' },
              description: { type: 'string', default: '' },
              start: { type: 'string', format: 'date-time' },
              until: { type: 'string', format: 'date-time' },
              isOverlayColor: { type: 'boolean', default: false },
              overlayColor: { type: 'string', default: '' },
              overlayColorRange: { type: 'string', default: '' },
              buttonTitleOne: { type: 'string', default: '' },
              buttonTitleTwo: { type: 'string', default: '' },
              newsLetterTitle: { type: 'string', default: '' },
              newsLetterDescription: { type: 'string', default: '' },
              aboutUsTitle: { type: 'string', default: '' },
              aboutUsDescription: { type: 'string', default: '' },
              contactUsTitle: { type: 'string', default: '' },
            },
          },
          promoPopup: {
            type: 'object',
            properties: {
              isEnable: { type: 'boolean', default: false },
              image: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  original: { type: 'string' },
                  thumbnail: { type: 'string' },
                },
              },
              title: { type: 'string', default: '' },
              description: { type: 'string', default: '' },
              popupDelay: { type: 'number', default: 0 },
              popupExpiredIn: { type: 'number', default: 0 },
              isNotShowAgain: { type: 'boolean', default: false },
            },
          },
        },
      },
      UpdateBusinessSettingsRequest: {
        type: 'object',
        properties: {
          operating_hours: {
            type: 'object',
            properties: {
              auto_close: { type: 'boolean' },
              schedule: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string' },
                    open_time: { type: 'string' },
                    close_time: { type: 'string' },
                    is_closed: { type: 'boolean' },
                  },
                },
              },
            },
          },
          delivery: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              radius: { type: 'number', description: 'Delivery radius in miles' },
              fee: { type: 'number' },
              min_order: { type: 'number' },
            },
          },
          fees: {
            type: 'object',
            properties: {
              service_fee: { type: 'number' },
              tip: { type: 'number' },
              tip_type: { type: 'string', enum: ['fixed', 'percentage'] },
            },
          },
          taxes: {
            type: 'object',
            properties: {
              sales_tax: { type: 'number' },
            },
          },
          orders: {
            properties: {
              accept_orders: { type: 'boolean' },
              allowScheduleOrder: { type: 'boolean' },
              maxDays: { type: 'number' },
              deliveredOrderTime: { type: 'number' },
            },
          },
          siteTitle: { type: 'string' },
          siteSubtitle: { type: 'string' },
          currency: { type: 'string' },
          seo: {
            type: 'object',
            properties: {
              metaTitle: { type: 'string' },
              metaDescription: { type: 'string' },
              ogTitle: { type: 'string' },
              ogDescription: { type: 'string' },
              ogImage: { type: 'object' },
              twitterHandle: { type: 'string' },
              twitterCardType: { type: 'string' },
              metaTags: { type: 'string' },
              canonicalUrl: { type: 'string' },
            },
          },
          logo: { type: 'object' },
          contactDetails: {
            type: 'object',
            properties: {
              location: { type: 'object' },
              contact: { type: 'string' },
              contacts: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              website: { type: 'string' },
              socials: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    icon: { type: 'string' },
                    url: { type: 'string' }
                  }
                }
              }
            }
          },
          // header_info removed
          footer_text: { type: 'string' },
          messages: {
            type: 'object',
            properties: {
              closed_message: { type: 'string' },
              not_accepting_orders_message: { type: 'string' },
            },
          },
          isUnderMaintenance: { type: 'boolean' },
          maintenance: {
            type: 'object',
            properties: {
              image: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  original: { type: 'string' },
                  thumbnail: { type: 'string' },
                },
              },
              title: { type: 'string' },
              description: { type: 'string' },
              start: { type: 'string', format: 'date-time' },
              until: { type: 'string', format: 'date-time' },
              isOverlayColor: { type: 'boolean' },
              overlayColor: { type: 'string' },
              overlayColorRange: { type: 'string' },
              buttonTitleOne: { type: 'string' },
              buttonTitleTwo: { type: 'string' },
              newsLetterTitle: { type: 'string' },
              newsLetterDescription: { type: 'string' },
              aboutUsTitle: { type: 'string' },
              aboutUsDescription: { type: 'string' },
              contactUsTitle: { type: 'string' },
            },
          },
          promoPopup: {
            type: 'object',
            properties: {
              isEnable: { type: 'boolean' },
              image: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  original: { type: 'string' },
                  thumbnail: { type: 'string' },
                },
              },
              title: { type: 'string' },
              description: { type: 'string' },
              popupDelay: { type: 'number' },
              popupExpiredIn: { type: 'number' },
              isNotShowAgain: { type: 'boolean' },
            },
          },
        },
      },
      Location: {
        type: 'object',
        required: [
          'id',
          'business_id',
          'branch_name',
          'address',
          'contact',
          'longitude',
          'latitude',
          'timeZone',
          'opening',
        ],
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          id: {
            type: 'string',
            example: 'loc-123456789',
            description: 'Location unique identifier',
          },
          business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Reference to business model',
          },
          branch_name: {
            type: 'string',
            example: 'Downtown Branch',
            description: 'Branch display name',
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Main St' },
              city: { type: 'string', example: 'New York' },
              state: { type: 'string', example: 'NY' },
              zipCode: { type: 'string', example: '10001' },
              country: { type: 'string', example: 'USA' },
              building: { type: 'string', example: 'Tower A' },
              floor: { type: 'string', example: '5th Floor' },
              landmark: { type: 'string', example: 'Near Central Park' },
            },
          },
          contact: {
            type: 'object',
            properties: {
              phone: { type: 'string', example: '+1234567890' },
              email: { type: 'string', format: 'email', example: 'downtown@business.com' },
              website: { type: 'string', example: 'https://business.com/downtown' },
            },
          },
          longitude: {
            type: 'number',
            example: -74.006,
            description: 'Location longitude coordinate',
          },
          latitude: {
            type: 'number',
            example: 40.7128,
            description: 'Location latitude coordinate',
          },
          timeZone: {
            type: 'string',
            example: 'America/New_York',
            description: 'Location timezone',
          },
          online_ordering: {
            type: 'object',
            properties: {
              pickup: { type: 'boolean', example: true },
              delivery: { type: 'boolean', example: true },
            },
          },
          opening: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_of_week: {
                  type: 'string',
                  enum: [
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ],
                },
                open_time: { type: 'string', example: '09:00' },
                close_time: { type: 'string', example: '22:00' },
                is_closed: { type: 'boolean', example: false },
              },
            },
          },
          isActive: { type: 'boolean', example: true, description: 'Location active status' },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Location creation timestamp',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateLocationRequest: {
        type: 'object',
        required: [
          'business_id',
          'branch_name',
          'address',
          'contact',
          'longitude',
          'latitude',
          'timeZone',
          'opening',
        ],
        properties: {
          business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business ID',
          },
          branch_name: { type: 'string', example: 'Downtown Branch', description: 'Branch name' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
              building: { type: 'string' },
              floor: { type: 'string' },
              landmark: { type: 'string' },
            },
          },
          contact: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              email: { type: 'string' },
              website: { type: 'string' },
            },
          },
          longitude: { type: 'number' },
          latitude: { type: 'number' },
          timeZone: { type: 'string' },
          online_ordering: {
            type: 'object',
            properties: {
              pickup: { type: 'boolean' },
              delivery: { type: 'boolean' },
            },
          },
          opening: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_of_week: { type: 'string' },
                open_time: { type: 'string' },
                close_time: { type: 'string' },
                is_closed: { type: 'boolean' },
              },
            },
          },
        },
      },
      UpdateLocationRequest: {
        type: 'object',
        properties: {
          branch_name: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
              building: { type: 'string' },
              floor: { type: 'string' },
              landmark: { type: 'string' },
            },
          },
          contact: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              email: { type: 'string' },
              website: { type: 'string' },
            },
          },
          longitude: { type: 'number' },
          latitude: { type: 'number' },
          timeZone: { type: 'string' },
          online_ordering: {
            type: 'object',
            properties: {
              pickup: { type: 'boolean' },
              delivery: { type: 'boolean' },
            },
          },
          opening: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_of_week: { type: 'string' },
                open_time: { type: 'string' },
                close_time: { type: 'string' },
                is_closed: { type: 'boolean' },
              },
            },
          },
          isActive: { type: 'boolean' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
          role: {
            type: 'string',
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            default: 'client',
            example: 'client',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 8, example: 'newpassword123' },
          confirmPassword: { type: 'string', example: 'newpassword123' },
        },
      },
      UpdatePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'oldpassword123' },
          newPassword: { type: 'string', minLength: 8, example: 'newpassword123' },
          confirmPassword: { type: 'string', example: 'newpassword123' },
        },
      },
      CreateRoleRequest: {
        type: 'object',
        required: ['name', 'displayName'],
        properties: {
          name: { type: 'string', example: 'content-manager' },
          displayName: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Can manage content but not users' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update'],
          },
        },
      },
      UpdateRoleRequest: {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'Updated Content Manager' },
          description: { type: 'string', example: 'Updated description' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update', 'content:delete'],
          },
        },
      },
      AssignRoleRequest: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        },
      },
      BanUserRequest: {
        type: 'object',
        properties: {
          isBanned: { type: 'boolean', example: true },
          banReason: { type: 'string', example: 'Violation of terms of service' },
        },
      },
      UpdatePermissionsRequest: {
        type: 'object',
        required: ['permissions'],
        properties: {
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create'],
          },
        },
      },
      Withdraw: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          business: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: "Joe's Pizza" }
            }
          },
          amount: { type: 'number', example: 500.00 },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
          notes: { type: 'string', example: 'Monthly withdrawal' },
          requestedBy: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateWithdrawRequest: {
        type: 'object',
        required: ['amount', 'businessId'],
        properties: {
          amount: { type: 'number', min: 1, example: 500.00 },
          businessId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          notes: { type: 'string', example: 'Urgent request' },
        },
      },
      UpdateWithdrawStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
          notes: { type: 'string', example: 'Processed successfully' },
        },
      },
    },
  },
  paths: {

    '/api/v1/categories': {
      get: {
        summary: 'Get all categories',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Pizza' },
                  description: { type: 'string', example: 'Delicious pizza category' },
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Category image',
                  },
                  business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Category created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/categories/{id}': {
      put: {
        summary: 'Update category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  image: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Category updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          404: {
            description: 'Category not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Category deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          404: {
            description: 'Category not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/items': {
      get: {
        summary: 'Get all items',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'business_id',
            schema: { type: 'string' },
            description: 'Business ID (required for non-super admins)',
          },
          {
            in: 'query',
            name: 'category_id',
            schema: { type: 'string' },
            description: 'Filter by category',
          },
          {
            in: 'query',
            name: 'is_active',
            schema: { type: 'boolean' },
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Items retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'base_price', 'category_id', 'business_id'],
                properties: {
                  business_id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  category_id: { type: 'string' },
                  sort_order: { type: 'integer' },
                  image: { type: 'string', format: 'binary' },
                  is_active: { type: 'boolean' },
                  is_available: { type: 'boolean' },
                  is_signature: { type: 'boolean' },
                  max_per_order: { type: 'integer' },
                  is_sizeable: { type: 'boolean' },
                  is_customizable: { type: 'boolean' },
                  sizes: {
                    type: 'string',
                    description: 'JSON array of size objects: [{"name": "string", "price": number, "is_default": boolean}]',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Item created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/items/{id}': {
      get: {
        summary: 'Get item details',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Item details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  base_price: { type: 'number' },
                  category_id: { type: 'string' },
                  sort_order: { type: 'integer' },
                  image: { type: 'string', format: 'binary' },
                  is_active: { type: 'boolean' },
                  is_available: { type: 'boolean' },
                  is_signature: { type: 'boolean' },
                  max_per_order: { type: 'integer' },
                  is_sizeable: { type: 'boolean' },
                  is_customizable: { type: 'boolean' },
                  sizes: {
                    type: 'string',
                    description: 'JSON array of size objects: [{"name": "string", "price": number, "is_default": boolean}]',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Item updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Item deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/business-settings': {
      get: {
        summary: 'Get business settings',
        tags: ['Business Settings'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'header',
            name: 'x-business-id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Business settings details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        settings: { $ref: '#/components/schemas/BusinessSettings' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update business settings',
        tags: ['Business Settings'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'header',
            name: 'x-business-id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBusinessSettingsRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Settings updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        settings: { $ref: '#/components/schemas/BusinessSettings' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Bad request - validation error or duplicate email',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Account not approved or banned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        summary: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid or expired refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        summary: 'Request password reset email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Password reset email sent' },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/verify-reset-token': {
      post: {
        summary: 'Verify password reset token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: {
                    type: 'string',
                    example: 'reset_token_here',
                    description: 'Password reset token received via email',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token is valid',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        summary: 'Reset password with token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: {
                    type: 'string',
                    example: 'reset_token_here',
                    description: 'Password reset token',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'newSecurePassword123',
                    description: 'New password (minimum 6 characters)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          400: {
            description: 'Invalid token or password requirements not met',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/update-password': {
      patch: {
        summary: 'Update user password (requires authentication)',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Authentication required or invalid current password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout user and clear cookies',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users': {
      get: {
        summary: 'Get all users (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 10 },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/{id}/approve': {
      patch: {
        summary: 'Approve a user account (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User approved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/{id}/ban': {
      patch: {
        summary: 'Ban or unban a user (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BanUserRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'User ban status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/{id}': {
      delete: {
        summary: 'Delete a user (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          204: {
            description: 'User deleted successfully',
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/{id}/permissions': {
      patch: {
        summary: 'Update user permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePermissionsRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'User permissions updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/{id}/permissions-get': {
      get: {
        summary: 'Get user permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        permissions: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        role: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/permissions': {
      get: {
        summary: 'Get all available permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All available permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        permissions: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Array of all available permissions',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/roles': {
      post: {
        summary: 'Create a new role (Admin only)',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoleRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Role created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or duplicate role name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get all roles',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of roles retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        roles: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Role' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/roles/{id}': {
      get: {
        summary: 'Get role by ID',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID',
          },
        ],
        responses: {
          200: {
            description: 'Role retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRoleRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Role updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Cannot modify system roles',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID',
          },
        ],
        responses: {
          204: {
            description: 'Role deleted successfully',
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          400: {
            description: 'Cannot delete system role or role assigned to users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/roles/users/{id}/assign': {
      patch: {
        summary: 'Assign role to user',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignRoleRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Role assigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User or role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/roles/users/{id}/remove': {
      patch: {
        summary: 'Remove role from user',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'Role removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/roles/users/{roleId}': {
      get: {
        summary: 'Get users with specific role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'roleId',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID',
          },
        ],
        responses: {
          200: {
            description: 'Users with role retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers': {
      post: {
        summary: 'Create a new customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phoneNumber'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  phoneNumber: { type: 'string', example: '+1234567890' },
                  rewards: { type: 'number', example: 100 },
                  notes: { type: 'string', example: 'VIP customer, prefers delivery' },
                },
                description: 'business_id is automatically set from current user\'s business',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get all customers (with optional filtering)',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'business_id',
            schema: { type: 'string' },
            description: 'Filter by business ID (automatically set for non-super-admins)',
          },
          {
            in: 'query',
            name: 'isActive',
            schema: { type: 'boolean' },
            description: 'Filter by active status',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of items per page',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search by name or email',
          },
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' },
                        },
                        paginatorInfo: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 100 },
                            currentPage: { type: 'integer', example: 1 },
                            lastPage: { type: 'integer', example: 10 },
                            perPage: { type: 'integer', example: 10 },
                            count: { type: 'integer', example: 10 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/{id}': {
      get: {
        summary: 'Get a single customer by ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
          },
        ],
        responses: {
          200: {
            description: 'Customer retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phoneNumber: { type: 'string' },
                  rewards: { type: 'number' },
                  notes: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Customer updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a customer (soft delete)',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
          },
        ],
        responses: {
          204: {
            description: 'Customer deleted successfully',
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/top-rewards': {
      get: {
        summary: 'Get top customers by rewards points',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of top customers to return',
          },
        ],
        responses: {
          200: {
            description: 'Top customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/business/{businessId}': {
      get: {
        summary: 'Get customers by business ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'businessId',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/location/{locationId}': {
      get: {
        summary: 'Get customers by location ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'locationId',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/{id}/rewards/add': {
      patch: {
        summary: 'Add rewards points to a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'number', minimum: 1, description: 'Number of points to add' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Rewards added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/{id}/rewards/redeem': {
      patch: {
        summary: 'Redeem rewards points from a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'number', minimum: 1, description: 'Number of points to redeem' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Rewards redeemed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Insufficient rewards points',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses': {
      post: {
        summary: 'Create a new business',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateBusinessRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Business created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        business: { $ref: '#/components/schemas/Business' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get all businesses',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of items per page',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search businesses by name or legal name',
          },
        ],
        responses: {
          200: {
            description: 'Businesses retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Business' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses/{id}': {
      get: {
        summary: 'Get business by ID',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          200: {
            description: 'Business retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Business' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update business by ID',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBusinessRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Business updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Business' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete business by ID',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          204: {
            description: 'Business deleted successfully',
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses/{id}/activate': {
      patch: {
        summary: 'Activate business',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          200: {
            description: 'Business activated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Business' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses/{id}/deactivate': {
      patch: {
        summary: 'Deactivate business',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          200: {
            description: 'Business deactivated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Business' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses/owner/{ownerId}': {
      get: {
        summary: 'Get businesses by owner',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'ownerId',
            required: true,
            schema: { type: 'string' },
            description: 'Owner user ID',
          },
        ],
        responses: {
          200: {
            description: 'Businesses retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Business' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/businesses/{id}/owner': {
      patch: {
        summary: 'Update business owner',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBusinessOwnerRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Business owner updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Business' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          400: {
            description: 'Invalid owner ID',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations': {
      post: {
        summary: 'Create a new location',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateLocationRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Location created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Business not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get all locations',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of items per page',
          },
          {
            in: 'query',
            name: 'business_id',
            schema: { type: 'string' },
            description: 'Filter by business ID',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search locations by branch name',
          },
        ],
        responses: {
          200: {
            description: 'Locations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Location' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations/nearby': {
      get: {
        summary: 'Get nearby locations',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'longitude',
            required: true,
            schema: { type: 'number' },
            description: 'User longitude',
          },
          {
            in: 'query',
            name: 'latitude',
            required: true,
            schema: { type: 'number' },
            description: 'User latitude',
          },
          {
            in: 'query',
            name: 'radius',
            schema: { type: 'number', default: 10 },
            description: 'Search radius in kilometers',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of results to return',
          },
        ],
        responses: {
          200: {
            description: 'Nearby locations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Location' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Longitude and latitude are required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations/business/{businessId}': {
      get: {
        summary: 'Get locations by business',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'businessId',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID',
          },
        ],
        responses: {
          200: {
            description: 'Locations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Location' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations/{id}': {
      get: {
        summary: 'Get location by ID',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        responses: {
          200: {
            description: 'Location retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update location by ID',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateLocationRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Location updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete location by ID',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        responses: {
          204: {
            description: 'Location deleted successfully',
          },
          404: {
            description: 'Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations/{id}/activate': {
      patch: {
        summary: 'Activate location',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        responses: {
          200: {
            description: 'Location activated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/locations/{id}/deactivate': {
      patch: {
        summary: 'Deactivate location',
        tags: ['Locations'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID',
          },
        ],
        responses: {
          200: {
            description: 'Location deactivated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/withdraws': {
      post: {
        summary: 'Create a withdraw request',
        tags: ['Withdraws'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateWithdrawRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Withdraw' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get all withdraws (Admin)',
        tags: ['Withdraws'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'List of withdraws',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Withdraw' }
                    }
                  }
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/withdraws/my-withdraws': {
      get: {
        summary: 'Get my withdraws',
        tags: ['Withdraws'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Withdraw' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/withdraws/{id}/status': {
      patch: {
        summary: 'Update withdraw status (Admin)',
        tags: ['Withdraws'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWithdrawStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Withdraw' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Export empty swaggerUi since we're not using it
export const swaggerUi = null;
