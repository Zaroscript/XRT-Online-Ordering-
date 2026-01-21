"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModifierGroupAssignment = void 0;
exports.ItemModifierGroupAssignment = {
    type: 'object',
    required: ['modifier_group_id', 'display_order'],
    description: 'Assignment of a modifier group to an item, with optional per-modifier overrides',
    properties: {
        modifier_group_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'ID of the modifier group to assign to this item',
        },
        display_order: {
            type: 'integer',
            minimum: 0,
            example: 1,
            description: 'Display order of this modifier group within the item',
        },
        modifier_overrides: {
            type: 'array',
            description: 'Item-level overrides for individual modifiers within this group. These overrides apply ONLY to this item and never affect the modifier or modifier group globally.',
            items: { $ref: '#/components/schemas/ItemModifierOverride' },
        },
    },
};
