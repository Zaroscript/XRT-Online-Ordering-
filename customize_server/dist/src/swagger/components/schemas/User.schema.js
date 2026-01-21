"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
exports.User = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        role: {
            type: 'string',
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            example: 'client',
        },
        permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create'],
        },
        isApproved: { type: 'boolean', example: true },
        isBanned: { type: 'boolean', example: false },
        banReason: { type: 'string', example: null },
        customRole: { type: 'string', example: null },
        lastLogin: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean', example: true },
        twoFactorEnabled: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
