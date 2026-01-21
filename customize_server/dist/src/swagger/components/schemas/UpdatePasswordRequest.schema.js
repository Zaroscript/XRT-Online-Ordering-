"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordRequest = void 0;
exports.UpdatePasswordRequest = {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
        currentPassword: { type: 'string', example: 'oldpassword123' },
        newPassword: { type: 'string', minLength: 8, example: 'newpassword123' },
        confirmPassword: { type: 'string', example: 'newpassword123' },
    },
};
