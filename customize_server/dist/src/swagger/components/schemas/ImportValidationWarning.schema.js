"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportValidationWarning = void 0;
exports.ImportValidationWarning = {
    type: 'object',
    properties: {
        file: {
            type: 'string',
            example: 'items.csv',
            description: 'Source file name',
        },
        row: {
            type: 'integer',
            example: 3,
            description: 'Row number in the file',
        },
        entity: {
            type: 'string',
            example: 'Item',
            description: 'Entity type',
        },
        field: {
            type: 'string',
            example: 'business_id',
            description: 'Field name with the warning',
        },
        message: {
            type: 'string',
            example: 'business_id mismatch. Using session business_id',
            description: 'Warning message',
        },
        value: {
            type: 'string',
            example: 'old_business_id',
            description: 'Value that triggered the warning',
        },
    },
};
