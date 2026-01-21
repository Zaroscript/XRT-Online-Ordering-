"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSize = void 0;
exports.ItemSize = {
    type: 'object',
    required: ['item_id', 'restaurant_id', 'name', 'code', 'price'],
    properties: {
        id: {
            type: 'string',
            example: '507f1f77bcf86cd799439013',
            description: 'Unique identifier for the item size',
        },
        item_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'ID of the item this size belongs to',
        },
        restaurant_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business/Restaurant ID that owns this item size',
        },
        name: {
            type: 'string',
            example: 'Large',
            description: 'Display name of the size (e.g., Small, Medium, Large, Extra Large)',
        },
        code: {
            type: 'string',
            example: 'L',
            description: 'Unique code for this size within the item (e.g., S, M, L, XL, XXL or custom codes). Used for modifier pricing mapping.',
        },
        price: {
            type: 'number',
            minimum: 0,
            example: 15.99,
            description: 'Price for this size (replaces base_price when is_sizeable is true)',
        },
        display_order: {
            type: 'integer',
            minimum: 0,
            example: 2,
            description: 'Display order for sorting sizes',
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this size is active and available',
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
            description: 'Timestamp when the size was created',
        },
        updated_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
            description: 'Timestamp when the size was last updated',
        },
    },
};
