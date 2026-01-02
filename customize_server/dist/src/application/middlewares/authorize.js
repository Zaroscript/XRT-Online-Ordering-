"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBusinessAccess = exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = exports.authorizeRoles = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.ForbiddenError('Authentication required');
        }
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            throw new AppError_1.ForbiddenError('You do not have permission to perform this action');
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Permission-based authorization
const requirePermission = (permission) => {
    return (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.ForbiddenError('Authentication required');
        }
        const hasPermission = await req.user.hasPermission(permission);
        if (!hasPermission) {
            throw new AppError_1.ForbiddenError(`Insufficient permissions. Required: ${permission}`);
        }
        next();
    });
};
exports.requirePermission = requirePermission;
// Check if user has any of the specified permissions
const requireAnyPermission = (permissions) => {
    return (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.ForbiddenError('Authentication required');
        }
        for (const permission of permissions) {
            const hasPermission = await req.user.hasPermission(permission);
            if (hasPermission) {
                return next();
            }
        }
        throw new AppError_1.ForbiddenError(`Insufficient permissions. Required one of: ${permissions.join(', ')}`);
    });
};
exports.requireAnyPermission = requireAnyPermission;
// Check if user has all specified permissions
const requireAllPermissions = (permissions) => {
    return (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.ForbiddenError('Authentication required');
        }
        const hasAllPermissions = await Promise.all(permissions.map((permission) => req.user.hasPermission(permission)));
        if (!hasAllPermissions.every(Boolean)) {
            throw new AppError_1.ForbiddenError(`Insufficient permissions. Required all of: ${permissions.join(', ')}`);
        }
        next();
    });
};
exports.requireAllPermissions = requireAllPermissions;
// Helper middleware to check if user belongs to business or is super admin
const requireBusinessAccess = (req, res, next) => {
    if (!req.user) {
        throw new AppError_1.ForbiddenError('Authentication required');
    }
    // Super admin can access any business
    if (req.user.role === roles_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    // For other roles, business_id must match
    const businessId = req.params.business_id || req.body.business_id || req.query.business_id;
    if (req.user.business_id !== businessId) {
        throw new AppError_1.ForbiddenError('Access denied to this business');
    }
    next();
};
exports.requireBusinessAccess = requireBusinessAccess;
