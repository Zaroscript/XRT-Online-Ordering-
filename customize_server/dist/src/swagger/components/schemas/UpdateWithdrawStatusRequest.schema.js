"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWithdrawStatusRequest = void 0;
exports.UpdateWithdrawStatusRequest = {
    type: 'object',
    required: ['status'],
    properties: {
        status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
        notes: { type: 'string', example: 'Processed successfully' },
    },
};
