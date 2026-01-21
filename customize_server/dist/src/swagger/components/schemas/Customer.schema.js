"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
exports.Customer = {
    type: 'object',
    required: ['name', 'email', 'phoneNumber'],
    properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        business_id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'Automatically set from current user\'s business' },
        rewards: { type: 'number', example: 150 },
        isActive: { type: 'boolean', example: true },
        last_order_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
        preferences: {
            type: 'object',
            properties: {
                dietary: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['vegetarian'],
                },
                allergies: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['nuts'],
                },
                favoriteItems: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Pizza', 'Burger'],
                },
                specialInstructions: { type: 'string', example: 'No onions please' },
            },
        },
        addresses: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['home', 'work', 'other'], example: 'home' },
                    street: { type: 'string', example: '123 Main St' },
                    city: { type: 'string', example: 'New York' },
                    state: { type: 'string', example: 'NY' },
                    zipCode: { type: 'string', example: '10001' },
                    country: { type: 'string', example: 'USA' },
                    isDefault: { type: 'boolean', example: true },
                },
            },
        },
        loyaltyTier: {
            type: 'string',
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            example: 'silver',
        },
        totalOrders: { type: 'number', example: 25 },
        totalSpent: { type: 'number', example: 1250.5 },
        notes: { type: 'string', example: 'VIP customer, prefers delivery' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
};
