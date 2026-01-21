"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modifier = void 0;
exports.Modifier = {
    type: 'object',
    required: ['name', 'modifier_group_id'],
    properties: {
        id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Unique identifier for the modifier',
        },
        modifier_group_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'ID of the modifier group this modifier belongs to',
        },
        name: {
            type: 'string',
            example: 'Pepperoni',
            description: 'Name of the modifier',
        },
        is_default: {
            type: 'boolean',
            example: false,
            description: 'Whether this modifier is selected by default',
        },
        max_quantity: {
            type: 'integer',
            minimum: 1,
            example: 3,
            description: 'Maximum quantity allowed for this modifier',
        },
        display_order: {
            type: 'integer',
            minimum: 0,
            example: 1,
            description: 'Order for displaying this modifier within the group',
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this modifier is active',
        },
        sides_config: {
            type: 'object',
            description: 'Sides configuration for this modifier. Controls whether this modifier supports sides selection (LEFT, RIGHT, WHOLE)',
            properties: {
                enabled: {
                    type: 'boolean',
                    example: true,
                    description: 'Whether sides are enabled for this modifier',
                },
                allowed_sides: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['LEFT', 'RIGHT', 'WHOLE'],
                    },
                    example: ['LEFT', 'RIGHT', 'WHOLE'],
                    description: 'Array of allowed sides for this modifier. Valid values: LEFT, RIGHT, WHOLE',
                },
            },
        },
        created_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
        updated_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
    },
};
