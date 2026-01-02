"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PERMISSIONS = exports.PERMISSIONS = exports.ROLES = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["BUSINESS_ADMIN"] = "admin";
    UserRole["STAFF"] = "manager";
    UserRole["CLIENT"] = "client";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLES = {
    SUPER_ADMIN: UserRole.SUPER_ADMIN,
    BUSINESS_ADMIN: UserRole.BUSINESS_ADMIN,
    STAFF: UserRole.STAFF,
    CLIENT: UserRole.CLIENT,
    USER: UserRole.USER,
};
// Permission constants
exports.PERMISSIONS = {
    // User management
    USERS_READ: 'users:read',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    USERS_APPROVE: 'users:approve',
    USERS_BAN: 'users:ban',
    // Content management
    CONTENT_READ: 'content:read',
    CONTENT_CREATE: 'content:create',
    CONTENT_UPDATE: 'content:update',
    CONTENT_DELETE: 'content:delete',
    CONTENT_PUBLISH: 'content:publish',
    // Categories
    CATEGORIES_READ: 'categories:read',
    CATEGORIES_CREATE: 'categories:create',
    CATEGORIES_UPDATE: 'categories:update',
    CATEGORIES_DELETE: 'categories:delete',
    // System
    SYSTEM_READ: 'system:read',
    SYSTEM_UPDATE: 'system:update',
    SYSTEM_BACKUP: 'system:backup',
    SYSTEM_LOGS: 'system:logs',
    // Profile
    PROFILE_READ: 'profile:read',
    PROFILE_UPDATE: 'profile:update',
    // Admin
    ADMIN_DASHBOARD: 'admin:dashboard',
    ADMIN_SETTINGS: 'admin:settings',
    ADMIN_ANALYTICS: 'admin:analytics',
    // Roles
    ROLES_READ: 'roles:read',
    ROLES_CREATE: 'roles:create',
    ROLES_UPDATE: 'roles:update',
    ROLES_DELETE: 'roles:delete',
    // Withdraws
    WITHDRAWS_READ: 'withdraws:read',
    WITHDRAWS_CREATE: 'withdraws:create',
    WITHDRAWS_UPDATE: 'withdraws:update',
    WITHDRAWS_DELETE: 'withdraws:delete',
    // Items
    ITEMS_READ: 'items:read',
    ITEMS_CREATE: 'items:create',
    ITEMS_UPDATE: 'items:update',
    ITEMS_DELETE: 'items:delete',
};
exports.ALL_PERMISSIONS = Object.values(exports.PERMISSIONS);
