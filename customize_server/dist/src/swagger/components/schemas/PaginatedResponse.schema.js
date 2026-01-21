"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponse = void 0;
exports.PaginatedResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Data retrieved successfully' },
        data: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: { type: 'object' },
                },
                paginatorInfo: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 100 },
                        currentPage: { type: 'integer', example: 1 },
                        lastPage: { type: 'integer', example: 10 },
                        perPage: { type: 'integer', example: 10 },
                        count: { type: 'integer', example: 10 },
                    },
                },
            },
        },
    },
};
