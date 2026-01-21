"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_management_paths = void 0;
exports.user_management_paths = {
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
    }
};
