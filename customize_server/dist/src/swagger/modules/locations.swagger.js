"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locations_paths = void 0;
exports.locations_paths = {
    '/api/v1/locations': {
        post: {
            summary: 'Create a new location',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateLocationRequest' },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Location created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Location' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Bad request - validation error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                404: {
                    description: 'Business not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        get: {
            summary: 'Get all locations',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    schema: { type: 'integer', default: 1 },
                    description: 'Page number for pagination',
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: { type: 'integer', default: 10 },
                    description: 'Number of items per page',
                },
                {
                    in: 'query',
                    name: 'business_id',
                    schema: { type: 'string' },
                    description: 'Filter by business ID',
                },
                {
                    in: 'query',
                    name: 'search',
                    schema: { type: 'string' },
                    description: 'Search locations by branch name',
                },
            ],
            responses: {
                200: {
                    description: 'Locations retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    results: { type: 'integer' },
                                    total: { type: 'integer' },
                                    page: { type: 'integer' },
                                    pages: { type: 'integer' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Location' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/locations/nearby': {
        get: {
            summary: 'Get nearby locations',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'longitude',
                    required: true,
                    schema: { type: 'number' },
                    description: 'User longitude',
                },
                {
                    in: 'query',
                    name: 'latitude',
                    required: true,
                    schema: { type: 'number' },
                    description: 'User latitude',
                },
                {
                    in: 'query',
                    name: 'radius',
                    schema: { type: 'number', default: 10 },
                    description: 'Search radius in kilometers',
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: { type: 'integer', default: 10 },
                    description: 'Number of results to return',
                },
            ],
            responses: {
                200: {
                    description: 'Nearby locations retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    results: { type: 'integer' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Location' },
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Longitude and latitude are required',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/locations/business/{businessId}': {
        get: {
            summary: 'Get locations by business',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'businessId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Business ID',
                },
            ],
            responses: {
                200: {
                    description: 'Locations retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    results: { type: 'integer' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Location' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/locations/{id}': {
        get: {
            summary: 'Get location by ID',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Location ID',
                },
            ],
            responses: {
                200: {
                    description: 'Location retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Location' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Location not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        put: {
            summary: 'Update location by ID',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Location ID',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateLocationRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Location updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Location' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Location not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Delete location by ID',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Location ID',
                },
            ],
            responses: {
                204: {
                    description: 'Location deleted successfully',
                },
                404: {
                    description: 'Location not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/locations/{id}/activate': {
        patch: {
            summary: 'Activate location',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Location ID',
                },
            ],
            responses: {
                200: {
                    description: 'Location activated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Location' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Location not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/locations/{id}/deactivate': {
        patch: {
            summary: 'Deactivate location',
            tags: ['Locations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Location ID',
                },
            ],
            responses: {
                200: {
                    description: 'Location deactivated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Location' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Location not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    }
};
