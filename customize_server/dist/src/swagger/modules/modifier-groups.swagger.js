"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifier_groups_paths = void 0;
exports.modifier_groups_paths = {
    '/api/v1/modifier-groups': {
        get: {
            summary: 'Get all modifier groups',
            tags: ['Modifier Groups'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'business_id',
                    schema: { type: 'string' },
                    description: 'Filter by business ID',
                },
                {
                    in: 'query',
                    name: 'name',
                    schema: { type: 'string' },
                    description: 'Search by name',
                },
                {
                    in: 'query',
                    name: 'is_active',
                    schema: { type: 'boolean' },
                    description: 'Filter by active status',
                },
                {
                    in: 'query',
                    name: 'display_type',
                    schema: { type: 'string', enum: ['RADIO', 'CHECKBOX'] },
                    description: 'Filter by display type',
                },
                {
                    in: 'query',
                    name: 'page',
                    schema: { type: 'integer', default: 1 },
                    description: 'Page number',
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: { type: 'integer', default: 20 },
                    description: 'Items per page',
                },
                {
                    in: 'query',
                    name: 'orderBy',
                    schema: { type: 'string', default: 'sort_order' },
                    description: 'Field to order by',
                },
                {
                    in: 'query',
                    name: 'sortedBy',
                    schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
                    description: 'Sort order',
                },
            ],
            responses: {
                200: {
                    description: 'Modifier groups retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier groups retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            modifierGroups: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/ModifierGroup' },
                                            },
                                            total: { type: 'integer', example: 10 },
                                            page: { type: 'integer', example: 1 },
                                            limit: { type: 'integer', example: 20 },
                                            totalPages: { type: 'integer', example: 1 },
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
            summary: 'Create a new modifier group',
            tags: ['Modifier Groups'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateModifierGroupRequest' },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Modifier group created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier group created successfully' },
                                    data: { $ref: '#/components/schemas/ModifierGroup' },
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
    '/api/v1/modifier-groups/{id}': {
        get: {
            summary: 'Get modifier group by ID',
            tags: ['Modifier Groups'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
            ],
            responses: {
                200: {
                    description: 'Modifier group retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier group retrieved successfully' },
                                    data: { $ref: '#/components/schemas/ModifierGroup' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Modifier group not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        put: {
            summary: 'Update modifier group',
            tags: ['Modifier Groups'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateModifierGroupRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Modifier group updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier group updated successfully' },
                                    data: { $ref: '#/components/schemas/ModifierGroup' },
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
                    description: 'Modifier group not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Delete modifier group (soft delete)',
            tags: ['Modifier Groups'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
            ],
            responses: {
                200: {
                    description: 'Modifier group deleted successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier group deleted successfully' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Cannot delete modifier group that is assigned to items',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                404: {
                    description: 'Modifier group not found',
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
