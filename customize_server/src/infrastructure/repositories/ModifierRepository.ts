import {
  IModifierRepository,
  PaginatedModifiers,
} from '../../domain/repositories/IModifierRepository';
import {
  Modifier,
  CreateModifierDTO,
  UpdateModifierDTO,
  ModifierFilters,
} from '../../domain/entities/Modifier';
import { ModifierModel, ModifierDocument } from '../database/models/ModifierModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class ModifierRepository implements IModifierRepository {
  private toDomain(document: ModifierDocument): Modifier {
    return {
      id: document._id.toString(),
      modifier_group_id: (document.modifier_group_id as any)._id
        ? (document.modifier_group_id as any)._id.toString()
        : document.modifier_group_id.toString(),
      modifier_group: (document.modifier_group_id as any).name
        ? {
            id: (document.modifier_group_id as any)._id.toString(),
            name: (document.modifier_group_id as any).name,
          }
        : undefined,
      name: document.name,
      display_order: document.display_order,
      is_active: document.is_active,
      sides_config: document.sides_config
        ? {
            enabled: document.sides_config.enabled || false,
            allowed_sides: document.sides_config.allowed_sides || [],
          }
        : undefined,
      created_at: document.created_at,
      updated_at: document.updated_at,
      deleted_at: document.deleted_at,
    };
  }

  async create(data: CreateModifierDTO): Promise<Modifier> {
    const modifierDoc = new ModifierModel({
      ...data,
      display_order: data.display_order ?? 0,
      is_active: data.is_active ?? true,
    });
    await modifierDoc.save();
    return this.toDomain(modifierDoc);
  }

  async findById(id: string, modifier_group_id?: string): Promise<Modifier | null> {
    const query: any = { _id: id, deleted_at: null };
    if (modifier_group_id) {
      query.modifier_group_id = modifier_group_id;
    }
    const modifierDoc = await ModifierModel.findOne(query);
    return modifierDoc ? this.toDomain(modifierDoc) : null;
  }

  async findActiveById(id: string, modifier_group_id?: string): Promise<Modifier | null> {
    const query: any = { _id: id, is_active: true, deleted_at: null };
    if (modifier_group_id) {
      query.modifier_group_id = modifier_group_id;
    }
    const modifierDoc = await ModifierModel.findOne(query);
    return modifierDoc ? this.toDomain(modifierDoc) : null;
  }

  async findAll(filters: ModifierFilters): Promise<Modifier[]> {
    const query: any = { deleted_at: null };

    if (filters.modifier_group_id) {
      query.modifier_group_id = filters.modifier_group_id;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    const modifierDocs = await ModifierModel.find(query)
      .populate('modifier_group_id', 'name')
      .sort({ display_order: 1, created_at: 1 });
    return modifierDocs.map((doc) => this.toDomain(doc));
  }

  async findByGroupId(modifier_group_id: string): Promise<Modifier[]> {
    const modifierDocs = await ModifierModel.find({
      modifier_group_id,
      deleted_at: null,
    }).sort({ display_order: 1, created_at: 1 });
    return modifierDocs.map((doc) => this.toDomain(doc));
  }

  async update(id: string, modifier_group_id: string, data: UpdateModifierDTO): Promise<Modifier> {
    const modifierDoc = await ModifierModel.findOneAndUpdate(
      { _id: id, modifier_group_id, deleted_at: null },
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!modifierDoc) {
      throw new NotFoundError('Modifier');
    }

    return this.toDomain(modifierDoc);
  }

  async delete(id: string, modifier_group_id: string): Promise<void> {
    // Soft delete - set deleted_at timestamp
    const modifierDoc = await ModifierModel.findOneAndUpdate(
      { _id: id, modifier_group_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!modifierDoc) {
      throw new NotFoundError('Modifier');
    }
  }

  async exists(name: string, modifier_group_id: string, excludeId?: string): Promise<boolean> {
    const query: any = {
      name,
      modifier_group_id,
      deleted_at: null,
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await ModifierModel.countDocuments(query);
    return count > 0;
  }

  async updateSortOrder(items: { id: string; order: number }[]): Promise<void> {
    if (!items || items.length === 0) return;

    const operations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { display_order: item.order },
      },
    }));

    await ModifierModel.bulkWrite(operations);
  }
}
