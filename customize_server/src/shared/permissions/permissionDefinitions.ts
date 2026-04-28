import { CreatePermissionDTO } from '../../domain/entities/Permission';

/**
 * Permission Definition Interface
 * Used to define permissions in code with full metadata
 */
export interface PermissionDefinition {
    key: string;
    module: string;
    action: string;
    description: string;
    isSystem?: boolean;
}

function dedupePermissionDefinitions(
    definitions: PermissionDefinition[]
): PermissionDefinition[] {
    const map = new Map<string, PermissionDefinition>();
    for (const def of definitions) {
        if (!map.has(def.key)) {
            map.set(def.key, def);
        }
    }
    return Array.from(map.values());
}

/**
 * All permission definitions for the system
 * These are automatically synced to the database on startup
 */
const RAW_PERMISSION_DEFINITIONS: PermissionDefinition[] = [
    // ============================================================
    // USERS MODULE
    // ============================================================
    {
        key: 'users:read',
        module: 'users',
        action: 'read',
        description: 'View users list and user details',
        isSystem: true,
    },
    {
        key: 'users:create',
        module: 'users',
        action: 'create',
        description: 'Create new users',
        isSystem: true,
    },
    {
        key: 'users:update',
        module: 'users',
        action: 'update',
        description: 'Update user information',
        isSystem: true,
    },
    {
        key: 'users:delete',
        module: 'users',
        action: 'delete',
        description: 'Delete users',
        isSystem: true,
    },
    {
        key: 'users:approve',
        module: 'users',
        action: 'approve',
        description: 'Approve user accounts',
        isSystem: true,
    },
    {
        key: 'users:ban',
        module: 'users',
        action: 'ban',
        description: 'Ban or unban users',
        isSystem: true,
    },

    // ============================================================
    // ROLES MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'roles:read',
        module: 'roles',
        action: 'read',
        description: 'View roles list and role details',
        isSystem: true,
    },
    {
        key: 'roles:create',
        module: 'roles',
        action: 'create',
        description: 'Create new custom roles',
        isSystem: true,
    },
    {
        key: 'roles:update',
        module: 'roles',
        action: 'update',
        description: 'Update roles and their permissions',
        isSystem: true,
    },
    {
        key: 'roles:delete',
        module: 'roles',
        action: 'delete',
        description: 'Delete custom roles',
        isSystem: true,
    },

    // ============================================================
    // PERMISSIONS MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'permissions:read',
        module: 'permissions',
        action: 'read',
        description: 'View all available permissions',
        isSystem: true,
    },
    {
        key: 'permissions:update',
        module: 'permissions',
        action: 'update',
        description: 'Enable or disable permissions',
        isSystem: true,
    },

    // ============================================================
    // CATEGORIES MODULE
    // ============================================================
    {
        key: 'categories:read',
        module: 'categories',
        action: 'read',
        description: 'View categories list and details',
    },
    {
        key: 'categories:create',
        module: 'categories',
        action: 'create',
        description: 'Create new categories',
    },
    {
        key: 'categories:update',
        module: 'categories',
        action: 'update',
        description: 'Update category information',
    },
    {
        key: 'categories:delete',
        module: 'categories',
        action: 'delete',
        description: 'Delete categories',
    },

    // ============================================================
    // ITEMS MODULE
    // ============================================================
    {
        key: 'items:read',
        module: 'items',
        action: 'read',
        description: 'View items list and details',
    },
    {
        key: 'items:create',
        module: 'items',
        action: 'create',
        description: 'Create new items',
    },
    {
        key: 'items:update',
        module: 'items',
        action: 'update',
        description: 'Update item information',
    },
    {
        key: 'items:delete',
        module: 'items',
        action: 'delete',
        description: 'Delete items',
    },

    // ============================================================
    // MODIFIER GROUPS MODULE
    // ============================================================
    {
        key: 'modifier_groups:read',
        module: 'modifier_groups',
        action: 'read',
        description: 'View modifier groups list and details',
    },
    {
        key: 'modifier_groups:create',
        module: 'modifier_groups',
        action: 'create',
        description: 'Create new modifier groups',
    },
    {
        key: 'modifier_groups:update',
        module: 'modifier_groups',
        action: 'update',
        description: 'Update modifier group information',
    },
    {
        key: 'modifier_groups:delete',
        module: 'modifier_groups',
        action: 'delete',
        description: 'Delete modifier groups',
    },

    // ============================================================
    // MODIFIERS MODULE
    // ============================================================
    {
        key: 'modifiers:read',
        module: 'modifiers',
        action: 'read',
        description: 'View modifiers list and details',
    },
    {
        key: 'modifiers:create',
        module: 'modifiers',
        action: 'create',
        description: 'Create new modifiers',
    },
    {
        key: 'modifiers:update',
        module: 'modifiers',
        action: 'update',
        description: 'Update modifier information',
    },
    {
        key: 'modifiers:delete',
        module: 'modifiers',
        action: 'delete',
        description: 'Delete modifiers',
    },

    // ============================================================
    // CUSTOMERS MODULE
    // ============================================================
    {
        key: 'customers:read',
        module: 'customers',
        action: 'read',
        description: 'View customers list and details',
    },
    {
        key: 'customers:create',
        module: 'customers',
        action: 'create',
        description: 'Create new customers',
    },
    {
        key: 'customers:update',
        module: 'customers',
        action: 'update',
        description: 'Update customer information',
    },
    {
        key: 'customers:delete',
        module: 'customers',
        action: 'delete',
        description: 'Delete customers',
    },

    // ============================================================
    // SETTINGS MODULE
    // ============================================================
    {
        key: 'settings:read',
        module: 'settings',
        action: 'read',
        description: 'View business settings',
    },
    {
        key: 'settings:update',
        module: 'settings',
        action: 'update',
        description: 'Update business settings',
    },

    // ============================================================
    // SYSTEM MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'system:read',
        module: 'system',
        action: 'read',
        description: 'View system information',
        isSystem: true,
    },
    {
        key: 'system:update',
        module: 'system',
        action: 'update',
        description: 'Update system configuration',
        isSystem: true,
    },
    {
        key: 'system:backup',
        module: 'system',
        action: 'backup',
        description: 'Create and manage backups',
        isSystem: true,
    },
    {
        key: 'system:logs',
        module: 'system',
        action: 'logs',
        description: 'View system logs',
        isSystem: true,
    },

    // ============================================================
    // PROFILE MODULE (Self)
    // ============================================================
    {
        key: 'profile:read',
        module: 'profile',
        action: 'read',
        description: 'View own profile',
    },
    {
        key: 'profile:update',
        module: 'profile',
        action: 'update',
        description: 'Update own profile',
    },

    // ============================================================
    // ADMIN MODULE
    // ============================================================
    {
        key: 'admin:dashboard',
        module: 'admin',
        action: 'dashboard',
        description: 'Access admin dashboard',
    },
    {
        key: 'admin:settings',
        module: 'admin',
        action: 'settings',
        description: 'Access admin settings',
    },
    {
        key: 'admin:analytics',
        module: 'admin',
        action: 'analytics',
        description: 'View analytics and reports',
    },

    // ============================================================
    // ORDERS MODULE
    // ============================================================
    { key: 'orders:read', module: 'orders', action: 'read', description: 'View orders list and details' },
    { key: 'orders:create', module: 'orders', action: 'create', description: 'Create orders' },
    { key: 'orders:update', module: 'orders', action: 'update', description: 'Update order status and order data' },
    { key: 'orders:delete', module: 'orders', action: 'delete', description: 'Delete orders' },
    { key: 'orders:reprint', module: 'orders', action: 'reprint', description: 'Trigger order reprint' },
    { key: 'orders:refund', module: 'orders', action: 'refund', description: 'Process order refunds and voids' },

    // ============================================================
    // PRINTERS MODULE
    // ============================================================
    { key: 'printers:read', module: 'printers', action: 'read', description: 'View printers list and details' },
    { key: 'printers:create', module: 'printers', action: 'create', description: 'Create printers' },
    { key: 'printers:update', module: 'printers', action: 'update', description: 'Update printers' },
    { key: 'printers:delete', module: 'printers', action: 'delete', description: 'Delete printers' },
    { key: 'printers:scan', module: 'printers', action: 'scan', description: 'Scan and discover printers' },
    { key: 'printers:test', module: 'printers', action: 'test', description: 'Run printer test print and connection checks' },

    // ============================================================
    // PRINT TEMPLATES MODULE
    // ============================================================
    { key: 'print_templates:read', module: 'print_templates', action: 'read', description: 'View print templates' },
    { key: 'print_templates:create', module: 'print_templates', action: 'create', description: 'Create print templates' },
    { key: 'print_templates:update', module: 'print_templates', action: 'update', description: 'Update print templates' },
    { key: 'print_templates:delete', module: 'print_templates', action: 'delete', description: 'Delete print templates' },

    // ============================================================
    // KITCHEN SECTIONS MODULE
    // ============================================================
    { key: 'kitchen_sections:read', module: 'kitchen_sections', action: 'read', description: 'View kitchen sections' },
    { key: 'kitchen_sections:create', module: 'kitchen_sections', action: 'create', description: 'Create kitchen sections' },
    { key: 'kitchen_sections:update', module: 'kitchen_sections', action: 'update', description: 'Update kitchen sections' },
    { key: 'kitchen_sections:delete', module: 'kitchen_sections', action: 'delete', description: 'Delete kitchen sections' },

    // ============================================================
    // COUPONS MODULE
    // ============================================================
    { key: 'coupons:read', module: 'coupons', action: 'read', description: 'View coupons' },
    { key: 'coupons:create', module: 'coupons', action: 'create', description: 'Create coupons' },
    { key: 'coupons:update', module: 'coupons', action: 'update', description: 'Update coupons' },
    { key: 'coupons:delete', module: 'coupons', action: 'delete', description: 'Delete coupons' },
    { key: 'coupons:approve', module: 'coupons', action: 'approve', description: 'Approve or disapprove coupons' },

    // ============================================================
    // SETTINGS-ADJACENT MODULES
    // ============================================================
    { key: 'taxes:read', module: 'taxes', action: 'read', description: 'View tax rules' },
    { key: 'taxes:create', module: 'taxes', action: 'create', description: 'Create tax rules' },
    { key: 'taxes:update', module: 'taxes', action: 'update', description: 'Update tax rules' },
    { key: 'taxes:delete', module: 'taxes', action: 'delete', description: 'Delete tax rules' },
    { key: 'prices:read', module: 'prices', action: 'read', description: 'View price updates and history' },
    { key: 'prices:update', module: 'prices', action: 'update', description: 'Apply and rollback price updates' },

    // ============================================================
    // MARKETING MODULES
    // ============================================================
    { key: 'emails:read', module: 'emails', action: 'read', description: 'View email campaigns' },
    { key: 'emails:create', module: 'emails', action: 'create', description: 'Create email campaigns' },
    { key: 'emails:update', module: 'emails', action: 'update', description: 'Update and resend email campaigns' },
    { key: 'emails:delete', module: 'emails', action: 'delete', description: 'Delete email campaigns' },
    { key: 'sms:read', module: 'sms', action: 'read', description: 'View SMS campaigns' },
    { key: 'sms:create', module: 'sms', action: 'create', description: 'Create SMS campaigns' },
    { key: 'sms:update', module: 'sms', action: 'update', description: 'Update and resend SMS campaigns' },
    { key: 'sms:delete', module: 'sms', action: 'delete', description: 'Delete SMS campaigns' },

    // ============================================================
    // LOYALTY MODULE
    // ============================================================
    { key: 'loyalty:read', module: 'loyalty', action: 'read', description: 'View loyalty settings and members' },
    { key: 'loyalty:update', module: 'loyalty', action: 'update', description: 'Update loyalty settings' },

    // ============================================================
    // ANALYTICS MODULE
    // ============================================================
    { key: 'analytics:read', module: 'analytics', action: 'read', description: 'View analytics dashboards and reports' },

    // ============================================================
    // IMPORT / EXPORT MODULE
    // ============================================================
    { key: 'imports:read', module: 'imports', action: 'read', description: 'View import sessions and validation' },
    { key: 'imports:create', module: 'imports', action: 'create', description: 'Create and confirm imports' },
    { key: 'imports:rollback', module: 'imports', action: 'rollback', description: 'Rollback import sessions' },
    { key: 'exports:read', module: 'exports', action: 'read', description: 'Export menu and settings data' },

    // ============================================================
    // DASHBOARD SECTIONS (UI visibility control)
    // ============================================================
    { key: 'dashboard:view', module: 'dashboard', action: 'view', description: 'Access dashboard home page' },
    { key: 'dashboard:orders_section', module: 'dashboard', action: 'orders_section', description: 'View Orders section in dashboard navigation' },
    { key: 'dashboard:menu_section', module: 'dashboard', action: 'menu_section', description: 'View Menu Management section in dashboard navigation' },
    { key: 'dashboard:printing_section', module: 'dashboard', action: 'printing_section', description: 'View Printing section in dashboard navigation' },
    { key: 'dashboard:users_section', module: 'dashboard', action: 'users_section', description: 'View User Control section in dashboard navigation' },
    { key: 'dashboard:promotional_section', module: 'dashboard', action: 'promotional_section', description: 'View Promotional section in dashboard navigation' },
    { key: 'dashboard:marketing_section', module: 'dashboard', action: 'marketing_section', description: 'View Marketing section in dashboard navigation' },
    { key: 'dashboard:settings_section', module: 'dashboard', action: 'settings_section', description: 'View Site Management section in dashboard navigation' },
];

export const PERMISSION_DEFINITIONS: PermissionDefinition[] =
    dedupePermissionDefinitions(RAW_PERMISSION_DEFINITIONS);

/**
 * Convert permission definitions to CreatePermissionDTO format
 */
export function getPermissionDTOs(): CreatePermissionDTO[] {
    return PERMISSION_DEFINITIONS.map((def) => ({
        key: def.key,
        module: def.module,
        action: def.action,
        description: def.description,
        isSystem: def.isSystem ?? false,
        isActive: def.isSystem ? true : false, // System permissions active by default
    }));
}

/**
 * Get all unique modules from permission definitions
 */
export function getModules(): string[] {
    const modules = new Set(PERMISSION_DEFINITIONS.map((p) => p.module));
    return Array.from(modules).sort();
}

/**
 * Get permission definitions grouped by module
 */
export function getPermissionsByModule(): Record<string, PermissionDefinition[]> {
    const grouped: Record<string, PermissionDefinition[]> = {};

    for (const perm of PERMISSION_DEFINITIONS) {
        if (!grouped[perm.module]) {
            grouped[perm.module] = [];
        }
        grouped[perm.module].push(perm);
    }

    return grouped;
}
