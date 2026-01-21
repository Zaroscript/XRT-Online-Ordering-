"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponse = void 0;
exports.ErrorResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Validation failed' },
    },
};
