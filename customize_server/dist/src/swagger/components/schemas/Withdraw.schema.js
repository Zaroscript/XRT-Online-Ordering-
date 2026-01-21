"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdraw = void 0;
exports.Withdraw = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        business: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                name: { type: 'string', example: "Joe's Pizza" }
            }
        },
        business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        amount: { type: 'number', example: 500.00 },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
        payment_method: { type: 'string', example: 'bank_transfer' },
        details: { type: 'string', example: 'Bank: Chaso, Account: 12345678' },
        note: { type: 'string', example: 'Monthly withdrawal' },
        approvedBy: { type: 'string', description: 'User ID who approved the request' },
        approvedAt: { type: 'string', format: 'date-time' },
        createdBy: { type: 'string', description: 'User ID who created the request' },
        requestedBy: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
