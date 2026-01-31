import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  PermissionFilters,
} from '../../domain/entities/Permission';
import { PermissionModel, PermissionDocument } from '../database/models/PermissionModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class PermissionRepository implements IPermissionRepository {
  private mapToEntity(doc: PermissionDocument): Permission {
    return {
      id: doc._id.toString(),
      key: doc.key,
      module: doc.module,
      action: doc.action,
      description: doc.description,
      isSystem: doc.isSystem,
      isActive: doc.isActive,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async findAll(filters?: PermissionFilters): Promise<Permission[]> {
    const query: any = {};

    if (filters?.module) {
      query.module = filters.module.toLowerCase();
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.isSystem !== undefined) {
      query.isSystem = filters.isSystem;
    }

    if (filters?.search) {
      query.$or = [
        { key: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const docs = await PermissionModel.find(query).sort({ module: 1, key: 1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<Permission | null> {
    const doc = await PermissionModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByKey(key: string): Promise<Permission | null> {
    const doc = await PermissionModel.findOne({ key: key.toLowerCase() });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByModule(module: string): Promise<Permission[]> {
    const docs = await PermissionModel.find({ module: module.toLowerCase() }).sort({ key: 1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findActive(): Promise<Permission[]> {
    const docs = await PermissionModel.find({ isActive: true }).sort({ module: 1, key: 1 });
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async create(data: CreatePermissionDTO): Promise<Permission> {
    const doc = await PermissionModel.create({
      key: data.key.toLowerCase(),
      module: data.module.toLowerCase(),
      action: data.action.toLowerCase(),
      description: data.description,
      isSystem: data.isSystem ?? false,
      isActive: data.isActive ?? false, // New permissions disabled by default
    });
    return this.mapToEntity(doc);
  }

  async createMany(data: CreatePermissionDTO[]): Promise<Permission[]> {
    const docs = await PermissionModel.insertMany(
      data.map((item) => ({
        key: item.key.toLowerCase(),
        module: item.module.toLowerCase(),
        action: item.action.toLowerCase(),
        description: item.description,
        isSystem: item.isSystem ?? false,
        isActive: item.isActive ?? false,
      })),
      { ordered: false } // Continue even if some fail (duplicates)
    );
    return docs.map((doc) => this.mapToEntity(doc as PermissionDocument));
  }

  async update(id: string, data: UpdatePermissionDTO): Promise<Permission | null> {
    const doc = await PermissionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const doc = await PermissionModel.findById(id);

    if (!doc) {
      throw new NotFoundError('Permission not found');
    }

    if (doc.isSystem) {
      throw new Error('Cannot delete system permission');
    }

    await PermissionModel.findByIdAndDelete(id);
    return true;
  }

  async existsByKey(key: string): Promise<boolean> {
    const count = await PermissionModel.countDocuments({ key: key.toLowerCase() });
    return count > 0;
  }

  async getModules(): Promise<string[]> {
    const modules = await PermissionModel.distinct('module');
    return modules.sort();
  }

  /**
   * Upsert permissions - insert if not exists, skip if exists
   * Used for syncing permissions from code definitions
   */
  async upsertMany(data: CreatePermissionDTO[]): Promise<{ inserted: number; skipped: number }> {
    const keys = data.map((d) => d.key.toLowerCase());

    // Batch check existence
    const existingDocs = await PermissionModel.find({
      key: { $in: keys },
    }).select('key');

    const existingKeys = new Set(existingDocs.map((d) => d.key));
    const newPermissions = data.filter((d) => !existingKeys.has(d.key.toLowerCase()));

    if (newPermissions.length > 0) {
      await this.createMany(newPermissions);
      newPermissions.forEach((p) => console.log(`  ➕ New permission registered: ${p.key}`));
    }

    return {
      inserted: newPermissions.length,
      skipped: data.length - newPermissions.length,
    };
  }
}
