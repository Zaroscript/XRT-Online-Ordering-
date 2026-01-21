"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.items_paths = void 0;
exports.items_paths = {
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
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Items retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            items: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/Item' },
                                            },
                                            total: { type: 'integer', example: 100 },
                                            page: { type: 'integer', example: 1 },
                                            limit: { type: 'integer', example: 10 },
                                            totalPages: { type: 'integer', example: 10 },
                                        },
                                    },
                                },
                            },
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
                                default_size_id: {
                                    type: 'string',
                                    description: 'ID of the default ItemSize (optional, can be set after creating sizes via POST /items/:itemId/sizes). Only used when is_sizeable is true.',
                                },
                                modifier_groups: {
                                    type: 'string',
                                    description: 'JSON array of modifier group assignments with optional per-modifier overrides: [{"modifier_group_id": "string", "display_order": number, "modifier_overrides": [{"modifier_id": "string", "max_quantity": number, "is_default": boolean, "prices_by_size": [{"sizeCode": "S|M|L|XL|XXL", "priceDelta": number}], "quantity_levels": [{"quantity": number, "name": string, "price": number, "is_default": boolean}]}]}]. Note: Sides configuration is now managed at the Modifier level, not at the Item-ModifierGroup level.',
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
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item created successfully' },
                                    data: { $ref: '#/components/schemas/Item' },
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
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item retrieved successfully' },
                                    data: { $ref: '#/components/schemas/Item' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Item not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                                default_size_id: {
                                    type: 'string',
                                    description: 'ID of the default ItemSize (optional). Only used when is_sizeable is true. Must reference an ItemSize that belongs to this item.',
                                },
                                modifier_groups: {
                                    type: 'string',
                                    description: 'JSON array of modifier group assignments with optional per-modifier overrides: [{"modifier_group_id": "string", "display_order": number, "modifier_overrides": [{"modifier_id": "string", "max_quantity": number, "is_default": boolean, "prices_by_size": [{"sizeCode": "S|M|L|XL|XXL", "priceDelta": number}], "quantity_levels": [{"quantity": number, "name": string, "price": number, "is_default": boolean}]}]}]. Note: Sides configuration is now managed at the Modifier level, not at the Item-ModifierGroup level.',
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
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item updated successfully' },
                                    data: { $ref: '#/components/schemas/Item' },
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
                    description: 'Item not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
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
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Item deleted successfully' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Item not found',
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
