"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleRequest = void 0;
exports.CreateRoleRequest = {
    type: 'object',
    required: ['name', 'displayName'],
    properties: {
        name: { type: 'string', example: 'content-manager' },
        displayName: { type: 'string', example: 'Content Manager' },
        description: { type: 'string', example: 'Can manage content but not users' },
        permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update'],
        },
    },
};
