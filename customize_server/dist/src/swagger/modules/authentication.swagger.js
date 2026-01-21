"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication_paths = void 0;
exports.authentication_paths = {
    '/api/v1/auth/register': {
        post: {
            summary: 'Register a new user',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterRequest' },
                    },
                },
            },
            responses: {
                201: {
                    description: 'User registered successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' },
                        },
                    },
                },
                400: {
                    description: 'Bad request - validation error or duplicate email',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/login': {
        post: {
            summary: 'Login user',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' },
                        },
                    },
                },
                401: {
                    description: 'Invalid credentials',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                403: {
                    description: 'Account not approved or banned',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/refresh-token': {
        post: {
            summary: 'Refresh access token using refresh token',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Token refreshed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    accessToken: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                401: {
                    description: 'Invalid or expired refresh token',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/forgot-password': {
        post: {
            summary: 'Request password reset email',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Password reset email sent',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    message: { type: 'string', example: 'Password reset email sent' },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: 'User not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/verify-reset-token': {
        post: {
            summary: 'Verify password reset token',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['token'],
                            properties: {
                                token: {
                                    type: 'string',
                                    example: 'reset_token_here',
                                    description: 'Password reset token received via email',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Token is valid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                        },
                    },
                },
                400: {
                    description: 'Invalid or expired token',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/reset-password': {
        post: {
            summary: 'Reset password with token',
            tags: ['Authentication'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['token', 'password'],
                            properties: {
                                token: {
                                    type: 'string',
                                    example: 'reset_token_here',
                                    description: 'Password reset token',
                                },
                                password: {
                                    type: 'string',
                                    format: 'password',
                                    example: 'newSecurePassword123',
                                    description: 'New password (minimum 6 characters)',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Password reset successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                        },
                    },
                },
                400: {
                    description: 'Invalid token or password requirements not met',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/me': {
        get: {
            summary: 'Get current user profile',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'User profile retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            user: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                401: {
                    description: 'Authentication required',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/update-password': {
        patch: {
            summary: 'Update user password (requires authentication)',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdatePasswordRequest' },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Password updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' },
                        },
                    },
                },
                401: {
                    description: 'Authentication required or invalid current password',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
            },
        },
    },
    '/api/v1/auth/logout': {
        post: {
            summary: 'Logout user and clear cookies',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Logged out successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }
};
