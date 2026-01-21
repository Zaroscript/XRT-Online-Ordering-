"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles_paths = void 0;
exports.roles_paths = {
    '/roles': {
        get: {
            summary: 'List all roles',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Roles list',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PaginatedResponse',
                            },
                        },
                    },
                },
            },
        },
        post: {
            summary: 'Create a role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['name', 'permissions'],
                            properties: {
                                name: { type: 'string' },
                                displayName: { type: 'string' },
                                description: { type: 'string' },
                                permissions: { type: 'array', items: { type: 'string' } },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Role created',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
                },
            },
        },
    },
    '/roles/{id}': {
        get: {
            summary: 'Get role details',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Role details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } } },
        },
        put: {
            summary: 'Update role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                displayName: { type: 'string' },
                                description: { type: 'string' },
                                permissions: { type: 'array', items: { type: 'string' } },
                            }
                        }
                    }
                }
            },
            responses: { 200: { description: 'Role updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } } },
        },
        delete: {
            summary: 'Delete role',
            tags: ['Roles'],
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Role deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } } },
        },
    }
};
