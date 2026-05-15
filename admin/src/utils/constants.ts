import { OwnerShipTransferStatus } from '@/types';
import { atom } from 'jotai';
export const LIMIT = 10;
export const SUPER_ADMIN = 'super_admin';
export const STORE_OWNER = 'client'; // Changed from 'store_owner' to 'client' to match backend
export const STAFF = 'staff';
export const TOKEN = 'token';
export const PERMISSIONS = 'permissions';
export const AUTH_CRED = 'AUTH_CRED';
export const EMAIL_VERIFIED = 'emailVerified';
export const CART_KEY = 'pick-cart';
export const CHECKOUT = 'pickbazar-checkout';
export const RESPONSIVE_WIDTH = 1024 as number;
export const MAINTENANCE_DETAILS = 'MAINTENANCE_DETAILS';
export const MAXIMUM_WORD_COUNT_FOR_RICH_TEXT_EDITOR: number = 10000;
export const phoneRegExp =
  /^\+?((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
export const URLRegExp =
  /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;

export const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// export const ACCEPTED_FILE_TYPES =
//   'image/*,application/pdf,application/zip,application/vnd.rar,application/epub+zip,.psd';

export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'image/svg+xml': ['.svg'],
  'application/pdf': [],
  'application/zip': [],
  'application/vnd.rar': [],
  'application/epub+zip': [],
  '.psd': [],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv'],
  'video/quicktime': ['.mov'],
};

export const searchModalInitialValues = atom(false);
export const miniSidebarInitialValue = atom(false);
export const checkIsMaintenanceModeComing = atom(false);
export const checkIsMaintenanceModeStart = atom(false);
export const approveModalInitialValues = atom(false);
export const OWNERSHIP_TRANSFER_STATUS = [
  OwnerShipTransferStatus['PENDING'],
  OwnerShipTransferStatus['PROCESSING'],
];

// ============================================================
// PERMISSION KEYS
// These must match exactly with the backend permission definitions
// ============================================================

export const PERMISSION_KEYS = {
  // Users Module
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_APPROVE: 'users:approve',
  USERS_BAN: 'users:ban',

  // Roles Module (Super Admin Only)
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  // Permissions Module (Super Admin Only)
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_UPDATE: 'permissions:update',

  // Categories Module
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // Items Module
  ITEMS_READ: 'items:read',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',

  // Modifier Groups Module
  MODIFIER_GROUPS_READ: 'modifier_groups:read',
  MODIFIER_GROUPS_CREATE: 'modifier_groups:create',
  MODIFIER_GROUPS_UPDATE: 'modifier_groups:update',
  MODIFIER_GROUPS_DELETE: 'modifier_groups:delete',

  // Modifiers Module
  MODIFIERS_READ: 'modifiers:read',
  MODIFIERS_CREATE: 'modifiers:create',
  MODIFIERS_UPDATE: 'modifiers:update',
  MODIFIERS_DELETE: 'modifiers:delete',

  // Customers Module
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  // Settings Module
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // System Module (Super Admin Only)
  SYSTEM_READ: 'system:read',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_LOGS: 'system:logs',

  // Profile Module (Self)
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',

  // Admin Module
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics',

  // Orders Module
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_REPRINT: 'orders:reprint',
  ORDERS_REFUND: 'orders:refund',

  // Printers Module
  PRINTERS_READ: 'printers:read',
  PRINTERS_CREATE: 'printers:create',
  PRINTERS_UPDATE: 'printers:update',
  PRINTERS_DELETE: 'printers:delete',
  PRINTERS_SCAN: 'printers:scan',
  PRINTERS_TEST: 'printers:test',

  // Print Templates Module
  PRINT_TEMPLATES_READ: 'print_templates:read',
  PRINT_TEMPLATES_CREATE: 'print_templates:create',
  PRINT_TEMPLATES_UPDATE: 'print_templates:update',
  PRINT_TEMPLATES_DELETE: 'print_templates:delete',

  // Kitchen Sections Module
  KITCHEN_SECTIONS_READ: 'kitchen_sections:read',
  KITCHEN_SECTIONS_CREATE: 'kitchen_sections:create',
  KITCHEN_SECTIONS_UPDATE: 'kitchen_sections:update',
  KITCHEN_SECTIONS_DELETE: 'kitchen_sections:delete',

  // Coupons Module
  COUPONS_READ: 'coupons:read',
  COUPONS_CREATE: 'coupons:create',
  COUPONS_UPDATE: 'coupons:update',
  COUPONS_DELETE: 'coupons:delete',
  COUPONS_APPROVE: 'coupons:approve',

  // Taxes / Shipping / Prices
  TAXES_READ: 'taxes:read',
  TAXES_CREATE: 'taxes:create',
  TAXES_UPDATE: 'taxes:update',
  TAXES_DELETE: 'taxes:delete',
  PRICES_READ: 'prices:read',
  PRICES_UPDATE: 'prices:update',

  // Marketing Modules
  EMAILS_READ: 'emails:read',
  EMAILS_CREATE: 'emails:create',
  EMAILS_UPDATE: 'emails:update',
  EMAILS_DELETE: 'emails:delete',
  SMS_READ: 'sms:read',
  SMS_CREATE: 'sms:create',
  SMS_UPDATE: 'sms:update',
  SMS_DELETE: 'sms:delete',

  // Loyalty / Analytics / Import-Export
  LOYALTY_READ: 'loyalty:read',
  LOYALTY_UPDATE: 'loyalty:update',
  ANALYTICS_READ: 'analytics:read',
  IMPORTS_READ: 'imports:read',
  IMPORTS_CREATE: 'imports:create',
  IMPORTS_ROLLBACK: 'imports:rollback',
  EXPORTS_READ: 'exports:read',

  // Dashboard Sections (UI visibility)
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ORDERS_SECTION: 'dashboard:orders_section',
  DASHBOARD_MENU_SECTION: 'dashboard:menu_section',
  DASHBOARD_PRINTING_SECTION: 'dashboard:printing_section',
  DASHBOARD_USERS_SECTION: 'dashboard:users_section',
  DASHBOARD_PROMOTIONAL_SECTION: 'dashboard:promotional_section',
  DASHBOARD_MARKETING_SECTION: 'dashboard:marketing_section',
  DASHBOARD_SETTINGS_SECTION: 'dashboard:settings_section',
} as const;

export type PermissionKey =
  (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];
