"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequest = void 0;
exports.LoginRequest = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
    },
};
