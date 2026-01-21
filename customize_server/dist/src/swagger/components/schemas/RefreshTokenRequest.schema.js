"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRequest = void 0;
exports.RefreshTokenRequest = {
    type: 'object',
    required: ['refreshToken'],
    properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
};
