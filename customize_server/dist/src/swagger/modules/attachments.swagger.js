"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachments_paths = void 0;
exports.attachments_paths = {
    '/api/v1/attachments': {
        post: {
            summary: 'Upload attachments',
            tags: ['Attachments'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                'attachment[]': {
                                    type: 'array',
                                    items: { type: 'string', format: 'binary' },
                                    description: 'Files to upload',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Attachments uploaded successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                url: { type: 'string', example: 'https://res.cloudinary.com/...' },
                                                public_id: { type: 'string', example: 'folder/filename' },
                                                original_name: { type: 'string', example: 'image.png' },
                                                mimetype: { type: 'string', example: 'image/png' },
                                                size: { type: 'number', example: 1024 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Bad Request',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                }
            },
        },
    },
};
