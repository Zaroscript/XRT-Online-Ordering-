"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLocationRequest = void 0;
exports.CreateLocationRequest = {
    type: 'object',
    required: [
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
        business_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Business ID',
        },
        branch_name: { type: 'string', example: 'Downtown Branch', description: 'Branch name' },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
                building: { type: 'string' },
                floor: { type: 'string' },
                landmark: { type: 'string' },
            },
        },
        contact: {
            type: 'object',
            properties: {
                phone: { type: 'string' },
                email: { type: 'string' },
                website: { type: 'string' },
            },
        },
        longitude: { type: 'number' },
        latitude: { type: 'number' },
        timeZone: { type: 'string' },
        online_ordering: {
            type: 'object',
            properties: {
                pickup: { type: 'boolean' },
                delivery: { type: 'boolean' },
            },
        },
        opening: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    day_of_week: { type: 'string' },
                    open_time: { type: 'string' },
                    close_time: { type: 'string' },
                    is_closed: { type: 'boolean' },
                },
            },
        },
    },
};
