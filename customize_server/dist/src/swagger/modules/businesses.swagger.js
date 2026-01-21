"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businesses_paths = void 0;
exports.businesses_paths = {
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
    }
};
