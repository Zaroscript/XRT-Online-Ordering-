"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessOwnerRequest = void 0;
exports.UpdateBusinessOwnerRequest = {
    type: 'object',
    required: ['ownerId'],
    properties: {
        ownerId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'New owner user ID',
        },
    },
};
