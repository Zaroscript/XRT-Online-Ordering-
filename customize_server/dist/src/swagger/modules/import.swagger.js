"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.import_paths = void 0;
exports.import_paths = {
    '/api/v1/import/parse': {
        post: {
            summary: 'Parse and validate import file (CSV or ZIP)',
            tags: ['Import'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['file'],
                            properties: {
                                file: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'CSV file or ZIP containing CSV files',
                                },
                                business_id: {
                                    type: 'string',
                                    description: 'Business ID for the import',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Import parsed and validated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import parsed and validated' },
                                    data: { $ref: '#/components/schemas/ImportSession' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                403: {
                    description: 'Forbidden - Super Admin only',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/import/sessions': {
        get: {
            summary: 'List import sessions',
            tags: ['Import'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'business_id',
                    schema: { type: 'string' },
                    description: 'Filter by business ID',
                },
            ],
            responses: {
                200: {
                    description: 'Import sessions retrieved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import sessions retrieved' },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ImportSession' },
                                    },
                                },
                            },
                        },
                    },
                },
                403: {
                    description: 'Forbidden - Super Admin only',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/import/sessions/{id}': {
        get: {
            summary: 'Get import session by ID',
            tags: ['Import'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Import session ID',
                },
            ],
            responses: {
                200: {
                    description: 'Import session retrieved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import session retrieved' },
                                    data: { $ref: '#/components/schemas/ImportSession' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'Import session not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
        put: {
            summary: 'Update import session (save draft)',
            tags: ['Import'],
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
                        schema: {
                            type: 'object',
                            properties: {
                                parsedData: { type: 'object', description: 'Updated parsed data' },
                                status: { type: 'string', enum: ['draft', 'validated'], example: 'draft' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Import session updated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import session updated' },
                                    data: { $ref: '#/components/schemas/ImportSession' },
                                },
                            },
                        },
                    },
                },
            },
        },
        delete: {
            summary: 'Discard import session',
            tags: ['Import'],
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
                    description: 'Import session discarded',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import session discarded' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/import/sessions/{id}/save': {
        post: {
            summary: 'Final save to database (transactional)',
            tags: ['Import'],
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
                    description: 'Import saved to database successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Import saved to database successfully' },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Validation error - cannot save with errors',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/import/sessions/{id}/errors': {
        get: {
            summary: 'Download validation errors as CSV',
            tags: ['Import'],
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
                    description: 'CSV file with validation errors',
                    content: {
                        'text/csv': {
                            schema: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        },
    }
};
