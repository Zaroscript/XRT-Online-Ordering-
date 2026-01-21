"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierGroup = void 0;
exports.ModifierGroup = {
    type: 'object',
    required: ['name', 'display_type', 'min_select', 'max_select', 'business_id'],
    properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business ID that owns this modifier group',
        },
        name: {
            type: 'string',
            example: 'Pizza Toppings',
            description: 'Name of the modifier group',
        },
        display_type: {
            type: 'string',
            enum: ['RADIO', 'CHECKBOX'],
            example: 'CHECKBOX',
            description: 'How modifiers are displayed: RADIO (single selection) or CHECKBOX (multiple selection)',
        },
        min_select: {
            type: 'integer',
            minimum: 0,
            example: 0,
            description: 'Minimum number of modifiers that must be selected',
        },
        max_select: {
            type: 'integer',
            minimum: 1,
            example: 5,
            description: 'Maximum number of modifiers that can be selected',
        },
        applies_per_quantity: {
            type: 'boolean',
            example: false,
            description: 'Whether selection rules apply per quantity/item',
        },
        quantity_levels: {
            type: 'array',
            description: 'Group-level default quantity levels (e.g., Light, Normal, Extra). These are inherited by all modifiers in the group unless overridden.',
            items: { $ref: '#/components/schemas/QuantityLevel' },
        },
        prices_by_size: {
            type: 'array',
            description: 'Group-level default pricing by size. These are inherited by all modifiers in the group unless overridden at modifier or item level.',
            items: { $ref: '#/components/schemas/PriceDelta' },
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this modifier group is active',
        },
        sort_order: {
            type: 'integer',
            example: 1,
            description: 'Display order for this modifier group',
        },
        created_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
        updated_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
    },
};
