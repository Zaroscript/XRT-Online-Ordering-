"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleRequest = void 0;
exports.UpdateRoleRequest = {
    type: 'object',
    properties: {
        displayName: { type: 'string', example: 'Updated Content Manager' },
        description: { type: 'string', example: 'Updated description' },
        permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update', 'content:delete'],
        },
    },
};
