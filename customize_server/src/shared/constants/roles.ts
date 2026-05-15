/**
 * System Roles & Permissions Constants
 * 
 * IMPORTANT: Only SUPER_ADMIN is a built-in system role.
 * All other roles are CUSTOM ROLES created by super_admin and stored in the database.
 */

// ============================================================
// SYSTEM ROLE (Built-in, immutable)
// ============================================================

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

/**
 * @deprecated Use SYSTEM_ROLES.SUPER_ADMIN instead.
 * This enum is kept for backward compatibility during migration.
 * Custom roles should be fetched from the database.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  // Legacy roles - these should be created as custom roles by super_admin
  BUSINESS_ADMIN = 'admin',
  STAFF = 'manager',
  CLIENT = 'client',
  USER = 'user',
}

/**
 * @deprecated Use SYSTEM_ROLES instead
 */
export const ROLES = {
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  BUSINESS_ADMIN: UserRole.BUSINESS_ADMIN,
  STAFF: UserRole.STAFF,
  CLIENT: UserRole.CLIENT,
  USER: UserRole.USER,
} as const;

// ============================================================
// PERMISSIONS
// ============================================================

/**
 * Permission key format: module:action
 * Examples: users:read, users:create, items:delete
 */
export const PERMISSIONS = {
  // ----------------------
  // User Management
  // ----------------------
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_APPROVE: 'users:approve',
  USERS_BAN: 'users:ban',

  // ----------------------
  // Categories
  // ----------------------
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // ----------------------
  // Items
  // ----------------------
  ITEMS_READ: 'items:read',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',

  // ----------------------
  // Modifier Groups
  // ----------------------
  MODIFIER_GROUPS_READ: 'modifier_groups:read',
  MODIFIER_GROUPS_CREATE: 'modifier_groups:create',
  MODIFIER_GROUPS_UPDATE: 'modifier_groups:update',
  MODIFIER_GROUPS_DELETE: 'modifier_groups:delete',

  // ----------------------
  // Modifiers
  // ----------------------
  MODIFIERS_READ: 'modifiers:read',
  MODIFIERS_CREATE: 'modifiers:create',
  MODIFIERS_UPDATE: 'modifiers:update',
  MODIFIERS_DELETE: 'modifiers:delete',

  // ----------------------
  // Customers
  // ----------------------
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  // ----------------------
  // Roles (Super Admin Only)
  // ----------------------
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  // ----------------------
  // Permissions (Super Admin Only)
  // ----------------------
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_UPDATE: 'permissions:update',

  // ----------------------
  // Settings
  // ----------------------
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // ----------------------
  // System (Super Admin Only)
  // ----------------------
  SYSTEM_READ: 'system:read',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_LOGS: 'system:logs',

  // ----------------------
  // Profile (Self)
  // ----------------------
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',

  // ----------------------
  // Admin
  // ----------------------
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics',

  // ----------------------
  // Orders
  // ----------------------
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_REPRINT: 'orders:reprint',
  ORDERS_REFUND: 'orders:refund',

  // ----------------------
  // Printers
  // ----------------------
  PRINTERS_READ: 'printers:read',
  PRINTERS_CREATE: 'printers:create',
  PRINTERS_UPDATE: 'printers:update',
  PRINTERS_DELETE: 'printers:delete',
  PRINTERS_SCAN: 'printers:scan',
  PRINTERS_TEST: 'printers:test',

  // ----------------------
  // Print Templates
  // ----------------------
  PRINT_TEMPLATES_READ: 'print_templates:read',
  PRINT_TEMPLATES_CREATE: 'print_templates:create',
  PRINT_TEMPLATES_UPDATE: 'print_templates:update',
  PRINT_TEMPLATES_DELETE: 'print_templates:delete',

  // ----------------------
  // Kitchen Sections
  // ----------------------
  KITCHEN_SECTIONS_READ: 'kitchen_sections:read',
  KITCHEN_SECTIONS_CREATE: 'kitchen_sections:create',
  KITCHEN_SECTIONS_UPDATE: 'kitchen_sections:update',
  KITCHEN_SECTIONS_DELETE: 'kitchen_sections:delete',

  // ----------------------
  // Coupons
  // ----------------------
  COUPONS_READ: 'coupons:read',
  COUPONS_CREATE: 'coupons:create',
  COUPONS_UPDATE: 'coupons:update',
  COUPONS_DELETE: 'coupons:delete',
  COUPONS_APPROVE: 'coupons:approve',

  // ----------------------
  // Taxes / Shipping / Prices
  // ----------------------
  TAXES_READ: 'taxes:read',
  TAXES_CREATE: 'taxes:create',
  TAXES_UPDATE: 'taxes:update',
  TAXES_DELETE: 'taxes:delete',
  PRICES_READ: 'prices:read',
  PRICES_UPDATE: 'prices:update',

  // ----------------------
  // Marketing
  // ----------------------
  EMAILS_READ: 'emails:read',
  EMAILS_CREATE: 'emails:create',
  EMAILS_UPDATE: 'emails:update',
  EMAILS_DELETE: 'emails:delete',
  SMS_READ: 'sms:read',
  SMS_CREATE: 'sms:create',
  SMS_UPDATE: 'sms:update',
  SMS_DELETE: 'sms:delete',

  // ----------------------
  // Loyalty / Analytics / Import-Export
  // ----------------------
  LOYALTY_READ: 'loyalty:read',
  LOYALTY_UPDATE: 'loyalty:update',
  ANALYTICS_READ: 'analytics:read',
  IMPORTS_READ: 'imports:read',
  IMPORTS_CREATE: 'imports:create',
  IMPORTS_ROLLBACK: 'imports:rollback',
  EXPORTS_READ: 'exports:read',

  // ----------------------
  // Dashboard Sections
  // ----------------------
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ORDERS_SECTION: 'dashboard:orders_section',
  DASHBOARD_MENU_SECTION: 'dashboard:menu_section',
  DASHBOARD_PRINTING_SECTION: 'dashboard:printing_section',
  DASHBOARD_USERS_SECTION: 'dashboard:users_section',
  DASHBOARD_PROMOTIONAL_SECTION: 'dashboard:promotional_section',
  DASHBOARD_MARKETING_SECTION: 'dashboard:marketing_section',
  DASHBOARD_SETTINGS_SECTION: 'dashboard:settings_section',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Check if a role is the super_admin system role
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === SYSTEM_ROLES.SUPER_ADMIN;
}

/**
 * Permissions that only super_admin can have/assign
 * These are system-level permissions that should never be assigned to custom roles
 */
export const SUPER_ADMIN_ONLY_PERMISSIONS: string[] = [
  PERMISSIONS.ROLES_CREATE,
  PERMISSIONS.ROLES_UPDATE,
  PERMISSIONS.ROLES_DELETE,
  PERMISSIONS.PERMISSIONS_UPDATE,
  PERMISSIONS.SYSTEM_UPDATE,
  PERMISSIONS.SYSTEM_BACKUP,
  PERMISSIONS.SYSTEM_LOGS,
  PERMISSIONS.USERS_APPROVE,
  PERMISSIONS.USERS_BAN,
];
