"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdraws_paths = void 0;
exports.withdraws_paths = {
    '/api/v1/withdraws': {
        post: {
            summary: 'Create a withdraw request',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateWithdrawRequest' },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Created',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Withdraw' },
                                },
                            },
                        },
                    },
                },
            },
        },
        get: {
            summary: 'Get all withdraws (Admin)',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    schema: { type: 'integer', default: 1 },
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: { type: 'integer', default: 10 },
                },
            ],
            responses: {
                200: {
                    description: 'List of withdraws',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Withdraw' }
                                    }
                                }
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/withdraws/my-withdraws': {
        get: {
            summary: 'Get my withdraws',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Withdraw' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/withdraws/{id}/status': {
        patch: {
            summary: 'Update withdraw status (Admin)',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateWithdrawStatusRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Withdraw' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/withdraws/{id}': {
        patch: {
            summary: 'Update withdraw request',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateWithdrawRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Updated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Withdraw' },
                                },
                            },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Delete withdraw request',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            responses: {
                204: {
                    description: 'Deleted',
                },
            },
        },
    },
    '/api/v1/withdraws/{id}/approve': {
        post: {
            summary: 'Approve withdraw request (Admin)',
            tags: ['Withdraws'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                },
            ],
            responses: {
                200: {
                    description: 'Approved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: { $ref: '#/components/schemas/Withdraw' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
