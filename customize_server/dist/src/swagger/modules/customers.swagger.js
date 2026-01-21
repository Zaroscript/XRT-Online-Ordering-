"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customers_paths = void 0;
exports.customers_paths = {
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
    }
};
