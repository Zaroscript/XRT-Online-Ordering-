"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role_management_paths = void 0;
exports.role_management_paths = {
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
    '/api/v1/roles/users/{userId}/assign': {
        patch: {
            summary: 'Assign role to user',
            tags: ['Role Management'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'userId',
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
    '/api/v1/roles/users/{userId}/remove': {
        patch: {
            summary: 'Remove role from user',
            tags: ['Role Management'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'userId',
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
    }
};
