"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Business = void 0;
exports.Business = {
    type: 'object',
    required: [
        'id',
        'owner',
        'name',
        'legal_name',
        'primary_content_name',
        'primary_content_email',
        'primary_content_phone',
    ],
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        id: {
            type: 'string',
            example: 'biz-123456789',
            description: 'Business unique identifier',
        },
        owner: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Reference to user who owns the business',
        },
        name: {
            type: 'string',
            example: "Joe's Pizza Place",
            description: 'Business display name',
        },
        legal_name: {
            type: 'string',
            example: "Joe's Pizza LLC",
            description: 'Legal business registration name',
        },
        primary_content_name: {
            type: 'string',
            example: 'Joe Smith',
            description: 'Primary contact person name',
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
            description: 'Primary contact phone number',
        },
        isActive: { type: 'boolean', example: true, description: 'Business active status' },
        created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Business creation timestamp',
        },
        description: {
            type: 'string',
            example: 'Best pizza in town!',
            description: 'Business description',
        },
        website: {
            type: 'string',
            example: 'https://joespizza.com',
            description: 'Business website URL',
        },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
            },
        },
        logo: {
            type: 'string',
            example: 'https://joespizza.com/logo.png',
            description: 'Business logo URL',
        },
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
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
