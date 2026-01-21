"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
exports.Category = {
    type: 'object',
    properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'Pizza' },
        description: { type: 'string', example: 'Delicious pizza category' },
        kitchen_section_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        sort_order: { type: 'integer', example: 1 },
        is_active: { type: 'boolean', example: true },
        image: { type: 'string', example: 'https://cloudinary.com/category.jpg' },
        image_public_id: { type: 'string', example: 'xrttech/categories/image_id' },
        icon: { type: 'string', example: 'https://cloudinary.com/icon.jpg' },
        icon_public_id: { type: 'string', example: 'xrttech/categories/icons/icon_id' },
        translated_languages: {
            type: 'array',
            items: { type: 'string' },
            example: ['en', 'ar'],
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
    },
};
