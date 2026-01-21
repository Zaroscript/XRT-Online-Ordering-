"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModifierOverride = void 0;
exports.ItemModifierOverride = {
    type: 'object',
    required: ['modifier_id'],
    description: 'Item-level override for a specific modifier. These overrides apply ONLY to the item and do not affect the modifier or modifier group globally.',
    properties: {
        modifier_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439012',
            description: 'ID of the modifier to override (must belong to the modifier group)',
        },
        prices_by_size: {
            type: 'array',
            description: 'Item-level price deltas per size for this modifier (overrides group and modifier defaults, optional)',
            items: { $ref: '#/components/schemas/ItemModifierPriceOverride' },
        },
        quantity_levels: {
            type: 'array',
            description: 'Item-level quantity levels for this modifier (overrides group and modifier defaults, optional)',
            items: { $ref: '#/components/schemas/ItemModifierQuantityLevelOverride' },
        },
    },
};
