"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.business_settings_paths = void 0;
exports.business_settings_paths = {
    '/api/v1/settings': {
        get: {
            summary: 'Get business settings',
            tags: ['Business Settings'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'header',
                    name: 'x-business-id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            responses: {
                200: {
                    description: 'Business settings details',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            settings: { $ref: '#/components/schemas/BusinessSettings' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        patch: {
            summary: 'Update business settings',
            tags: ['Business Settings'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'header',
                    name: 'x-business-id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateBusinessSettingsRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Settings updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            settings: { $ref: '#/components/schemas/BusinessSettings' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }
};
