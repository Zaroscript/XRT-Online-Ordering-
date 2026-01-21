"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceDelta = void 0;
exports.PriceDelta = {
    type: 'object',
    required: ['sizeCode', 'priceDelta'],
    properties: {
        sizeCode: {
            type: 'string',
            enum: ['S', 'M', 'L', 'XL', 'XXL'],
            example: 'M',
            description: 'Size code for pricing',
        },
        priceDelta: {
            type: 'number',
            example: 1.50,
            description: 'Price delta (additional cost) for this size',
        },
    },
};
