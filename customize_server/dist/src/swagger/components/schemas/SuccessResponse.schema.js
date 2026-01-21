"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponse = void 0;
exports.SuccessResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operation successful' },
        data: { type: 'object' },
    },
};
