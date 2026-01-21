"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModifierRequest = void 0;
exports.UpdateModifierRequest = {
    type: 'object',
    properties: {
        name: { type: 'string', example: 'Pepperoni' },
        is_default: { type: 'boolean', example: false },
        max_quantity: { type: 'integer', minimum: 1, example: 3 },
        display_order: { type: 'integer', minimum: 0, example: 1 },
        is_active: { type: 'boolean', example: true },
    },
};
