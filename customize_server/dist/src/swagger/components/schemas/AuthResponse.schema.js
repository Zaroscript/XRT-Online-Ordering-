"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponse = void 0;
exports.AuthResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: {
            type: 'object',
            properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    },
};
