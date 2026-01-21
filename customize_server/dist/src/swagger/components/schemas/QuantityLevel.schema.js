"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantityLevel = void 0;
exports.QuantityLevel = {
    type: 'object',
    required: ['quantity'],
    properties: {
        quantity: {
            type: 'integer',
            minimum: 1,
            example: 2,
            description: 'Quantity value (e.g., 1, 2, 3)',
        },
        name: {
            type: 'string',
            example: 'Normal',
            description: 'Display name for this quantity level (e.g., Light, Normal, Extra)',
        },
        price: {
            type: 'number',
            example: 0,
            description: 'Additional price for this quantity level',
        },
        is_default: {
            type: 'boolean',
            example: true,
            description: 'Whether this is the default quantity level (only one can be default)',
        },
        display_order: {
            type: 'integer',
            minimum: 0,
            example: 1,
            description: 'Order for displaying this quantity level',
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this quantity level is active',
        },
    },
};
