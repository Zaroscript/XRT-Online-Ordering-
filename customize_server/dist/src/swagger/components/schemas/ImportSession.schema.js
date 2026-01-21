"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSession = void 0;
exports.ImportSession = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Unique identifier for the import session',
        },
        user_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'User ID who created the session',
        },
        business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business ID for the import',
        },
        status: {
            type: 'string',
            enum: ['draft', 'validated', 'confirmed', 'discarded'],
            example: 'validated',
            description: 'Session status: draft (has errors), validated (no errors), confirmed (saved to DB), discarded',
        },
        parsedData: {
            type: 'object',
            description: 'Parsed import data (Items, ItemSizes, ModifierGroups, Modifiers, ItemModifierOverrides)',
            properties: {
                items: { type: 'array', items: { type: 'object' } },
                itemSizes: { type: 'array', items: { type: 'object' } },
                modifierGroups: { type: 'array', items: { type: 'object' } },
                modifiers: { type: 'array', items: { type: 'object' } },
                itemModifierOverrides: { type: 'array', items: { type: 'object' } },
            },
        },
        validationErrors: {
            type: 'array',
            items: { $ref: '#/components/schemas/ImportValidationError' },
            description: 'Blocking validation errors (must be fixed before saving)',
        },
        validationWarnings: {
            type: 'array',
            items: { $ref: '#/components/schemas/ImportValidationWarning' },
            description: 'Non-blocking validation warnings',
        },
        originalFiles: {
            type: 'array',
            items: { type: 'string' },
            example: ['items.csv', 'sizes.csv'],
            description: 'Original file names uploaded',
        },
        expires_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-08T10:30:00Z',
            description: 'Session expiration date (7 days from creation, auto-deleted after)',
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
        },
        updated_at: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:30:00Z',
        },
    },
};
