"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
exports.Role = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'content-manager' },
        displayName: { type: 'string', example: 'Content Manager' },
        description: { type: 'string', example: 'Can manage content but not users' },
        permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update'],
        },
        isSystem: { type: 'boolean', example: false },
        createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
