"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModifierPriceOverride = void 0;
exports.ItemModifierPriceOverride = {
    type: 'object',
    required: ['sizeCode', 'priceDelta'],
    properties: {
        sizeCode: {
            type: 'string',
            enum: ['S', 'M', 'L', 'XL', 'XXL'],
            example: 'L',
            description: 'Size code that should match ItemSize.code for the item. Used to map modifier pricing to specific item sizes.',
        },
        priceDelta: {
            type: 'number',
            example: 2.50,
            description: 'Item-level price delta for this size (overrides group and modifier defaults)',
        },
    },
};
