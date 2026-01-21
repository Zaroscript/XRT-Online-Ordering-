"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanUserRequest = void 0;
exports.BanUserRequest = {
    type: 'object',
    properties: {
        isBanned: { type: 'boolean', example: true },
        banReason: { type: 'string', example: 'Violation of terms of service' },
    },
};
