"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBusinessRequest = void 0;
exports.CreateBusinessRequest = {
    type: 'object',
    required: [
        'owner',
        'name',
        'legal_name',
        'primary_content_name',
        'primary_content_email',
        'primary_content_phone',
    ],
    properties: {
        owner: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'User ID of the business owner',
        },
        name: {
            type: 'string',
            example: "Joe's Pizza Place",
            description: 'Business display name',
        },
        legal_name: {
            type: 'string',
            example: "Joe's Pizza LLC",
            description: 'Legal business name',
        },
        primary_content_name: {
            type: 'string',
            example: 'Joe Smith',
            description: 'Primary contact name',
        },
        primary_content_email: {
            type: 'string',
            format: 'email',
            example: 'joe@joespizza.com',
            description: 'Primary contact email',
        },
        primary_content_phone: {
            type: 'string',
            example: '+1234567890',
            description: 'Primary contact phone',
        },
        description: {
            type: 'string',
            example: 'Best pizza in town!',
            description: 'Business description',
        },
        website: {
            type: 'string',
            example: 'https://joespizza.com',
            description: 'Business website',
        },
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
    },
};
