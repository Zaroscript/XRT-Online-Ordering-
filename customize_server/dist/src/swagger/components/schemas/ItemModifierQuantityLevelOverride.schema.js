"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModifierQuantityLevelOverride = void 0;
exports.ItemModifierQuantityLevelOverride = {
    type: 'object',
    required: ['quantity'],
    properties: {
        quantity: {
            type: 'integer',
            minimum: 1,
            example: 2,
            description: 'Quantity value for this level',
        },
        name: {
            type: 'string',
            example: 'Extra',
            description: 'Display name for this quantity level',
        },
        price: {
            type: 'number',
            example: 1.00,
            description: 'Additional price for this quantity level',
        },
        is_default: {
            type: 'boolean',
            example: false,
            description: 'Whether this is the default quantity level (only one can be default)',
        },
        display_order: {
            type: 'integer',
            minimum: 0,
            example: 1,
            description: 'Display order for this quantity level',
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this quantity level is active',
        },
    },
};
