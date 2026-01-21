"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories_paths = void 0;
exports.categories_paths = {
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
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Categories retrieved successfully' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Category' },
                                    },
                                },
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
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Category created successfully' },
                                    data: { $ref: '#/components/schemas/Category' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Validation error',
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
    '/api/v1/categories/{id}': {
        get: {
            summary: 'Get category by ID',
            tags: ['Categories'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Category ID',
                },
            ],
            responses: {
                200: {
                    description: 'Category retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Category retrieved successfully' },
                                    data: { $ref: '#/components/schemas/Category' },
                                },
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
            },
        },
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
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Category updated successfully' },
                                    data: { $ref: '#/components/schemas/Category' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Category deleted successfully' },
                                },
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
    }
};
