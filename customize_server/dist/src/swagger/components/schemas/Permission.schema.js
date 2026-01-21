"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
exports.Permission = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        key: { type: 'string', example: 'users:read' },
        module: { type: 'string', example: 'users' },
        action: { type: 'string', example: 'read' },
        description: { type: 'string', example: 'View users' },
        isSystem: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
