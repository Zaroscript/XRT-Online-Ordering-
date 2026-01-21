"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
exports.Location = {
    type: 'object',
    required: [
        'id',
        'business_id',
        'branch_name',
        'address',
        'contact',
        'longitude',
        'latitude',
        'timeZone',
        'opening',
    ],
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        id: {
            type: 'string',
            example: 'loc-123456789',
            description: 'Location unique identifier',
        },
        business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Reference to business model',
        },
        branch_name: {
            type: 'string',
            example: 'Downtown Branch',
            description: 'Branch display name',
        },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
                building: { type: 'string', example: 'Tower A' },
                floor: { type: 'string', example: '5th Floor' },
                landmark: { type: 'string', example: 'Near Central Park' },
            },
        },
        contact: {
            type: 'object',
            properties: {
                phone: { type: 'string', example: '+1234567890' },
                email: { type: 'string', format: 'email', example: 'downtown@business.com' },
                website: { type: 'string', example: 'https://business.com/downtown' },
            },
        },
        longitude: {
            type: 'number',
            example: -74.006,
            description: 'Location longitude coordinate',
        },
        latitude: {
            type: 'number',
            example: 40.7128,
            description: 'Location latitude coordinate',
        },
        timeZone: {
            type: 'string',
            example: 'America/New_York',
            description: 'Location timezone',
        },
        online_ordering: {
            type: 'object',
            properties: {
                pickup: { type: 'boolean', example: true },
                delivery: { type: 'boolean', example: true },
            },
        },
        opening: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    day_of_week: {
                        type: 'string',
                        enum: [
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                            'sunday',
                        ],
                    },
                    open_time: { type: 'string', example: '09:00' },
                    close_time: { type: 'string', example: '22:00' },
                    is_closed: { type: 'boolean', example: false },
                },
            },
        },
        isActive: { type: 'boolean', example: true, description: 'Location active status' },
        created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Location creation timestamp',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
