"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWithdrawRequest = void 0;
exports.CreateWithdrawRequest = {
    type: 'object',
    required: ['amount', 'businessId'],
    properties: {
        amount: { type: 'number', min: 1, example: 500.00 },
        businessId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        notes: { type: 'string', example: 'Urgent request' },
    },
};
