"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessRequest = void 0;
exports.UpdateBusinessRequest = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Business display name' },
        legal_name: { type: 'string', description: 'Legal business name' },
        primary_content_name: { type: 'string', description: 'Primary contact name' },
        primary_content_email: {
            type: 'string',
            format: 'email',
            description: 'Primary contact email',
        },
        primary_content_phone: { type: 'string', description: 'Primary contact phone' },
        description: { type: 'string', description: 'Business description' },
        website: { type: 'string', description: 'Business website' },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
            },
        },
        logo: { type: 'string', description: 'Business logo URL' },
        location: {
            type: 'object',
            properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: {
                    type: 'array',
                    items: { type: 'number' },
                    example: [-73.935242, 40.73061],
                },
            },
        },
        google_maps_verification: { type: 'boolean', example: false },
        social_media: {
            type: 'object',
            properties: {
                facebook: { type: 'string' },
                instagram: { type: 'string' },
                whatsapp: { type: 'string' },
                tiktok: { type: 'string' },
            },
        },
        header_info: { type: 'string' },
        footer_text: { type: 'string' },
        messages: {
            type: 'object',
            properties: {
                closed_message: { type: 'string' },
                not_accepting_orders_message: { type: 'string' },
            },
        },
        timezone: { type: 'string', example: 'America/New_York' },
        isActive: { type: 'boolean', description: 'Business active status' },
    },
};
