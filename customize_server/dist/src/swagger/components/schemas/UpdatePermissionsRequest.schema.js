"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionsRequest = void 0;
exports.UpdatePermissionsRequest = {
    type: 'object',
    required: ['permissions'],
    properties: {
        permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create'],
        },
    },
};
