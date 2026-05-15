import { Permission } from '@/types';

export type PermissionUiGroupId =
  | 'dashboard_access'
  | 'orders_guests'
  | 'menu_catalog'
  | 'printing_kitchen'
  | 'promos_loyalty'
  | 'marketing_channels'
  | 'store_config'
  | 'bulk_data'
  | 'insights'
  | 'team_access'
  | 'system'
  | 'other';

/** Logical groups used in Add/Edit Role — related modules bundled for easier scanning */
const UI_GROUP_MODULES: readonly {
  id: Exclude<PermissionUiGroupId, 'other'>;
  titleKey: string;
  modules: readonly string[];
}[] = [
  {
    id: 'dashboard_access',
    titleKey: 'permission-group-dashboard-access',
    modules: ['dashboard', 'admin'],
  },
  {
    id: 'orders_guests',
    titleKey: 'permission-group-orders-guests',
    modules: ['orders', 'customers'],
  },
  {
    id: 'menu_catalog',
    titleKey: 'permission-group-menu-catalog',
    modules: ['categories', 'items', 'modifier_groups', 'modifiers'],
  },
  {
    id: 'printing_kitchen',
    titleKey: 'permission-group-printing-kitchen',
    modules: ['printers', 'print_templates', 'kitchen_sections'],
  },
  {
    id: 'promos_loyalty',
    titleKey: 'permission-group-promos-loyalty',
    modules: ['coupons', 'loyalty'],
  },
  {
    id: 'marketing_channels',
    titleKey: 'permission-group-marketing-channels',
    modules: ['emails', 'sms'],
  },
  {
    id: 'store_config',
    titleKey: 'permission-group-store-config',
    modules: ['settings', 'taxes', 'prices'],
  },
  {
    id: 'bulk_data',
    titleKey: 'permission-group-import-export',
    modules: ['imports', 'exports'],
  },
  {
    id: 'insights',
    titleKey: 'permission-group-analytics',
    modules: ['analytics'],
  },
  {
    id: 'team_access',
    titleKey: 'permission-group-team-access',
    modules: ['users', 'roles', 'permissions', 'profile'],
  },
  {
    id: 'system',
    titleKey: 'permission-group-system',
    modules: ['system'],
  },
];

export type PermissionGroupSection = {
  groupId: PermissionUiGroupId;
  titleKey: string;
  moduleSections: Array<{ module: string; permissions: Permission[] }>;
};

export function buildPermissionUiGroups(
  modules: string[],
  permissionsByModule: Record<string, Permission[]>,
): PermissionGroupSection[] {
  const used = new Set<string>();
  const out: PermissionGroupSection[] = [];

  for (const def of UI_GROUP_MODULES) {
    const moduleSections = def.modules
      .filter((m) => modules.includes(m))
      .map((module) => ({
        module,
        permissions: permissionsByModule[module] ?? [],
      }))
      .filter((s) => s.permissions.length > 0);
    moduleSections.forEach((s) => used.add(s.module));
    if (moduleSections.length === 0) continue;
    out.push({
      groupId: def.id,
      titleKey: def.titleKey,
      moduleSections,
    });
  }

  const leftovers = modules.filter((m) => !used.has(m));
  if (leftovers.length === 0) {
    return out;
  }

  const moduleSections = leftovers
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((module) => ({
      module,
      permissions: permissionsByModule[module] ?? [],
    }))
    .filter((s) => s.permissions.length > 0);

  if (moduleSections.length === 0) {
    return out;
  }

  out.push({
    groupId: 'other',
    titleKey: 'permission-group-other',
    moduleSections,
  });
  return out;
}

export function collectKeysFromSections(
  moduleSections: Array<{ permissions: Permission[] }>,
): string[] {
  return moduleSections.flatMap((s) =>
    (s.permissions ?? []).map((p) => p.key),
  );
}
