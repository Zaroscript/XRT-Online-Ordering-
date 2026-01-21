"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRequest = void 0;
exports.RegisterRequest = {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        password: { type: 'string', minLength: 8, example: 'password123' },
        role: {
            type: 'string',
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            default: 'client',
            example: 'client',
        },
    },
};
