import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository';
import {
  getPermissionDTOs,
  PERMISSION_DEFINITIONS,
  PermissionDefinition,
} from './permissionDefinitions';
import { CreatePermissionDTO } from '../../domain/entities/Permission';

/** Syncs permission definitions from code to DB on startup; never deletes existing. */
class PermissionRegistry {
  private permissionRepository: PermissionRepository;
  private registeredPermissions: Map<string, PermissionDefinition> = new Map();
  private synced: boolean = false;

  constructor() {
    this.permissionRepository = new PermissionRepository();

    // Pre-register all defined permissions
    for (const perm of PERMISSION_DEFINITIONS) {
      this.registeredPermissions.set(perm.key, perm);
    }
  }

  getAll(): PermissionDefinition[] {
    return Array.from(this.registeredPermissions.values());
  }

  isRegistered(key: string): boolean {
    return this.registeredPermissions.has(key);
  }

  get(key: string): PermissionDefinition | undefined {
    return this.registeredPermissions.get(key);
  }

  /** In-memory only; not persisted to DB. */
  register(permission: PermissionDefinition): void {
    if (!this.registeredPermissions.has(permission.key)) {
      this.registeredPermissions.set(permission.key, permission);
    }
  }

  /** Insert new permissions; never delete or change existing. New ones default disabled. */
  async syncWithDatabase(): Promise<{ inserted: number; skipped: number; total: number }> {
    const permissionDTOs = getPermissionDTOs();
    const result = await this.permissionRepository.upsertMany(permissionDTOs);

    this.synced = true;

    return {
      inserted: result.inserted,
      skipped: result.skipped,
      total: permissionDTOs.length,
    };
  }

  isSynced(): boolean {
    return this.synced;
  }

  getByModule(): Record<string, PermissionDefinition[]> {
    const grouped: Record<string, PermissionDefinition[]> = {};

    for (const perm of this.registeredPermissions.values()) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    }

    return grouped;
  }

  validatePermissionKeys(keys: string[]): { valid: boolean; invalid: string[] } {
    const invalid: string[] = [];

    for (const key of keys) {
      if (!this.registeredPermissions.has(key)) {
        invalid.push(key);
      }
    }

    return {
      valid: invalid.length === 0,
      invalid,
    };
  }

  getSystemPermissionKeys(): string[] {
    return Array.from(this.registeredPermissions.values())
      .filter((p) => p.isSystem)
      .map((p) => p.key);
  }

  isSystemPermission(key: string): boolean {
    const perm = this.registeredPermissions.get(key);
    return perm?.isSystem ?? false;
  }
}

// Singleton instance
export const permissionRegistry = new PermissionRegistry();
