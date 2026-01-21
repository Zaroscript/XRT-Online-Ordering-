"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
exports.Item = {
    type: 'object',
    required: ['name', 'base_price', 'category_id', 'business_id'],
    properties: {
        id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Unique identifier for the item',
        },
        business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business ID that owns this item',
        },
        name: {
            type: 'string',
            example: 'Margherita Pizza',
            description: 'Name of the item',
        },
        description: {
            type: 'string',
            example: 'Classic cheese pizza with fresh basil and mozzarella',
            description: 'Detailed description of the item',
        },
        sort_order: {
            type: 'integer',
            example: 1,
            description: 'Display order for sorting items',
        },
        is_active: {
            type: 'boolean',
            example: true,
            description: 'Whether this item is active and visible',
        },
        base_price: {
            type: 'number',
            minimum: 0,
            example: 12.99,
            description: 'Base price of the item. Used ONLY when is_sizeable is false. Ignored when is_sizeable is true (use ItemSize prices instead).',
        },
        category_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439012',
            description: 'ID of the category this item belongs to',
        },
        image: {
            type: 'string',
            example: 'https://cloudinary.com/item.jpg',
            description: 'URL of the item image',
        },
        image_public_id: {
            type: 'string',
            example: 'xrttech/items/item123',
            description: 'Cloudinary public ID for image management and deletion',
        },
        is_available: {
            type: 'boolean',
            example: true,
            description: 'Whether this item is currently available for ordering',
        },
        is_signature: {
            type: 'boolean',
            example: false,
            description: 'Whether this is a signature/highlighted item',
        },
        max_per_order: {
            type: 'integer',
            minimum: 1,
            example: 10,
            description: 'Maximum quantity that can be ordered in a single order',
        },
        is_sizeable: {
            type: 'boolean',
            example: false,
            description: 'Whether this item supports multiple sizes. If true: base_price is ignored, sizes are managed via /items/:itemId/sizes endpoint, at least one size must exist, default_size_id must reference a size of this item.',
        },
        is_customizable: {
            type: 'boolean',
            example: true,
            description: 'Whether this item can be customized with modifiers',
        },
        default_size_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439013',
            description: 'ID of the default ItemSize (only used when is_sizeable is true). Must reference an ItemSize that belongs to this item.',
        },
        sizes: {
            type: 'array',
            description: 'List of sizes available for this item with their specific prices',
            items: {
                type: 'object',
                properties: {
                    size_id: { type: 'string', description: 'ID of the ItemSize' },
                    price: { type: 'number', description: 'Price for this specific size' },
                    is_default: { type: 'boolean', description: 'Is this the default size?' },
                    is_active: { type: 'boolean', description: 'Is this size currently active?' }
                }
            }
        },
        modifier_groups: {
            type: 'array',
            description: 'Modifier groups assigned to this item. Each assignment can include item-specific configuration and per-modifier overrides that apply ONLY to this item (never affecting other items or global modifier/group settings).',
            items: { $ref: '#/components/schemas/ItemModifierGroupAssignment' },
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
            description: 'Timestamp when the item was created',
        },
        updated_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
            description: 'Timestamp when the item was last updated',
        },
    },
};
