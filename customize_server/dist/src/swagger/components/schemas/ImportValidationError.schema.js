"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportValidationError = void 0;
exports.ImportValidationError = {
    type: 'object',
    properties: {
        file: {
            type: 'string',
            example: 'items.csv',
            description: 'Source file name',
        },
        row: {
            type: 'integer',
            example: 5,
            description: 'Row number in the file (1-indexed, excluding header)',
        },
        entity: {
            type: 'string',
            example: 'Item',
            description: 'Entity type (Item, ItemSize, ModifierGroup, Modifier, ItemModifierOverride)',
        },
        field: {
            type: 'string',
            example: 'item_key',
            description: 'Field name with the error',
        },
        message: {
            type: 'string',
            example: 'item_key is required',
            description: 'Error message',
        },
        value: {
            type: 'string',
            example: '',
            description: 'Invalid value (if any)',
        },
    },
};
