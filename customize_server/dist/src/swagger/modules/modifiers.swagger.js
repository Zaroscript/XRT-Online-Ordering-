"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifiers_paths = void 0;
exports.modifiers_paths = {
    '/api/v1/modifier-groups/{groupId}/modifiers': {
        get: {
            summary: 'Get all modifiers in a modifier group',
            tags: ['Modifiers'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'groupId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
            ],
            responses: {
                200: {
                    description: 'Modifiers retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifiers retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            modifiers: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/Modifier' },
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
        post: {
            summary: 'Create a new modifier in a modifier group',
            tags: ['Modifiers'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'groupId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateModifierRequest' },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Modifier created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier created successfully' },
                                    data: { $ref: '#/components/schemas/Modifier' },
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
    },
    '/api/v1/modifier-groups/{groupId}/modifiers/{id}': {
        put: {
            summary: 'Update a modifier',
            tags: ['Modifiers'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'groupId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier ID',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateModifierRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Modifier updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier updated successfully' },
                                    data: { $ref: '#/components/schemas/Modifier' },
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
                    description: 'Modifier not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Delete a modifier (soft delete)',
            tags: ['Modifiers'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'groupId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier group ID',
                },
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Modifier ID',
                },
            ],
            responses: {
                200: {
                    description: 'Modifier deleted successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Modifier deleted successfully' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Modifier not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/modifiers': {
        get: {
            summary: 'Get all modifiers (Flat)',
            tags: ['Modifiers'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Success',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
                }
            }
        }
    }
};
