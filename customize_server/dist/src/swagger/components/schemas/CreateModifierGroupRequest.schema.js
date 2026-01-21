"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateModifierGroupRequest = void 0;
exports.CreateModifierGroupRequest = {
    type: 'object',
    required: ['name', 'display_type', 'min_select', 'max_select'],
    properties: {
        name: { type: 'string', example: 'Pizza Toppings' },
        display_type: { type: 'string', enum: ['RADIO', 'CHECKBOX'], example: 'CHECKBOX' },
        min_select: { type: 'integer', minimum: 0, example: 0 },
        max_select: { type: 'integer', minimum: 1, example: 5 },
        quantity_levels: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    quantity: { type: 'integer', minimum: 1, example: 2 },
                    name: { type: 'string', example: 'Normal' },
                    price: { type: 'number', example: 0 },
                    is_default: { type: 'boolean', example: true },
                    display_order: { type: 'integer', minimum: 0, example: 1 },
                    is_active: { type: 'boolean', example: true },
                },
            },
        },
        prices_by_size: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sizeCode: { type: 'string', enum: ['S', 'M', 'L', 'XL', 'XXL'], example: 'M' },
                    priceDelta: { type: 'number', example: 1.5 },
                },
            },
        },
        is_active: { type: 'boolean', example: true },
        sort_order: { type: 'integer', example: 1 },
        business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    },
};
