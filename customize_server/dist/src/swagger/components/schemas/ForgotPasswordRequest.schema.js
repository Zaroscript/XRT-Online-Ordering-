"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordRequest = void 0;
exports.ForgotPasswordRequest = {
    type: 'object',
    required: ['email'],
    properties: {
        email: { type: 'string', format: 'email', example: 'john@example.com' },
    },
};
