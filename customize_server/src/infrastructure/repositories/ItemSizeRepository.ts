import { IItemSizeRepository } from '../../domain/repositories/IItemSizeRepository';
import {
  ItemSize,
  CreateItemSizeDTO,
  UpdateItemSizeDTO,
  ItemSizeFilters,
} from '../../domain/entities/ItemSize';
import { ItemSizeModel, ItemSizeDocument } from '../database/models/ItemSizeModel';

export class ItemSizeRepository implements IItemSizeRepository {
  private toDomain(document: ItemSizeDocument): ItemSize {
    return {
      id: document._id.toString(),
      business_id: document.business_id,
      name: document.name,
      code: document.code,
      display_order: document.display_order,
      is_active: document.is_active,
      created_at: document.created_at,
      updated_at: document.updated_at,
      deleted_at: document.deleted_at,
    };
  }

  async create(data: CreateItemSizeDTO): Promise<ItemSize> {
    const itemSizeDoc = new ItemSizeModel(data);
    await itemSizeDoc.save();
    return this.toDomain(itemSizeDoc);
  }

  async findById(id: string): Promise<ItemSize | null> {
    const itemSizeDoc = await ItemSizeModel.findOne({ _id: id });
    return itemSizeDoc ? this.toDomain(itemSizeDoc) : null;
  }

  async findAll(filters: ItemSizeFilters): Promise<ItemSize[]> {
    const query: any = {};

    if (filters.business_id) {
      query.business_id = filters.business_id;
    }

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    const itemSizeDocs = await ItemSizeModel.find(query).sort({ display_order: 1, created_at: 1 });

    return itemSizeDocs.map((doc) => this.toDomain(doc));
  }

  async update(id: string, data: UpdateItemSizeDTO): Promise<ItemSize> {
    const itemSizeDoc = await ItemSizeModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    });

    if (!itemSizeDoc) {
      throw new Error('Item size not found');
    }

    return this.toDomain(itemSizeDoc);
  }

  async delete(id: string): Promise<void> {
    // Soft delete usually preferred, but UseCase might enforce checks.
    // If we want soft delete:
    // await ItemSizeModel.findOneAndUpdate({ _id: id }, { deleted_at: new Date() });
    // For now, sticking to interface contract which implies deletion.
    const result = await ItemSizeModel.findOneAndDelete({ _id: id });
    if (!result) {
      throw new Error('Item size not found');
    }
  }

  async exists(code: string, business_id: string, excludeId?: string): Promise<boolean> {
    const query: any = { code, business_id };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await ItemSizeModel.countDocuments(query);
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

    await ItemSizeModel.bulkWrite(operations);
  }
}
