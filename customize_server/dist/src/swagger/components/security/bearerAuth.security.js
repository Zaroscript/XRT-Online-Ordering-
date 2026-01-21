"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearerAuth = void 0;
exports.bearerAuth = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT access token obtained from login endpoint',
};
