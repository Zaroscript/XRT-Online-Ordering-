"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.item_sizes_paths = void 0;
exports.item_sizes_paths = {
    '/api/v1/items/{itemId}/sizes': {
        get: {
            summary: 'Get all sizes for an item',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'itemId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item',
                },
                {
                    in: 'query',
                    name: 'is_active',
                    schema: { type: 'boolean' },
                    description: 'Filter by active status',
                },
            ],
            responses: {
                200: {
                    description: 'Item sizes retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item sizes retrieved successfully' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ItemSize' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        post: {
            summary: 'Create item size',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'itemId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['name', 'code', 'price'],
                            properties: {
                                name: {
                                    type: 'string',
                                    example: 'Large',
                                    description: 'Display name of the size',
                                },
                                code: {
                                    type: 'string',
                                    example: 'L',
                                    description: 'Unique code for this size within the item (e.g., S, M, L, XL, XXL). Used for modifier pricing mapping.',
                                },
                                price: {
                                    type: 'number',
                                    minimum: 0,
                                    example: 15.99,
                                    description: 'Price for this size',
                                },
                                display_order: {
                                    type: 'integer',
                                    minimum: 0,
                                    example: 2,
                                    description: 'Display order for sorting',
                                },
                                is_active: {
                                    type: 'boolean',
                                    example: true,
                                    description: 'Whether this size is active',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Item size created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item size created successfully' },
                                    data: { $ref: '#/components/schemas/ItemSize' },
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
            },
        },
    },
    '/api/v1/items/{itemId}/sizes/{id}': {
        get: {
            summary: 'Get item size by ID',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'itemId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item',
                },
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item size',
                },
            ],
            responses: {
                200: {
                    description: 'Item size retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item size retrieved successfully' },
                                    data: { $ref: '#/components/schemas/ItemSize' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Item size not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        put: {
            summary: 'Update item size',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'itemId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item',
                },
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item size',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'Large' },
                                code: {
                                    type: 'string',
                                    example: 'L',
                                    description: 'Unique code for this size (must be unique per item)',
                                },
                                price: { type: 'number', minimum: 0, example: 16.99 },
                                display_order: { type: 'integer', minimum: 0, example: 2 },
                                is_active: { type: 'boolean', example: true },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Item size updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item size updated successfully' },
                                    data: { $ref: '#/components/schemas/ItemSize' },
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
                    description: 'Item size not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Delete item size',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'itemId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item',
                },
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID of the item size',
                },
            ],
            responses: {
                200: {
                    description: 'Item size deleted successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item size deleted successfully' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Validation error (e.g., cannot delete default size or last size)',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                404: {
                    description: 'Item size not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/sizes': {
        get: {
            summary: 'Get all item sizes (Flat List)',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'List of all item sizes',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ItemSize' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Create item size (Flat)',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['name', 'code', 'price', 'business_id'],
                            properties: {
                                business_id: { type: 'string' },
                                name: { type: 'string' },
                                code: { type: 'string' },
                                price: { type: 'number' },
                                display_order: { type: 'number' },
                                is_active: { type: 'boolean' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Created',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/ItemSize' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/api/v1/sizes/{id}': {
        get: {
            summary: 'Get item size (Flat)',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
            responses: {
                200: {
                    description: 'Success',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemSize' } } }
                }
            }
        },
        put: {
            summary: 'Update item size (Flat)',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                price: { type: 'number' },
                                is_active: { type: 'boolean' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Updated',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemSize' } } }
                }
            }
        },
        delete: {
            summary: 'Delete item size (Flat)',
            tags: ['Item Sizes'],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
            responses: {
                204: {
                    description: 'Deleted'
                }
            }
        }
    }
};
