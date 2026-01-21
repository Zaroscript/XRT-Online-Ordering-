"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions_paths = void 0;
exports.permissions_paths = {
    '/api/v1/permissions': {
        get: {
            summary: 'List all permissions',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Permissions list',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/permissions/grouped': {
        get: {
            summary: 'Get permissions grouped by module',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Grouped permissions',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
                },
            },
        },
    },
    '/api/v1/permissions/modules': {
        get: {
            summary: 'Get all permission modules',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Permission modules',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
                },
            },
        },
    },
    '/api/v1/permissions/{id}': {
        get: {
            summary: 'Get permission by ID',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
            responses: {
                200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/Permission' } } } }
            }
        },
        patch: {
            summary: 'Update permission',
            tags: ['Permissions'],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePermissionsRequest' } } }
            },
            responses: {
                200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Permission' } } } }
            }
        }
    }
};
