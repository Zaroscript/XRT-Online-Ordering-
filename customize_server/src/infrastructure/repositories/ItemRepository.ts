import { IItemRepository, PaginatedItems } from '../../domain/repositories/IItemRepository';
import { Item, CreateItemDTO, UpdateItemDTO, ItemFilters } from '../../domain/entities/Item';
import { ItemModel, ItemDocument } from '../database/models/ItemModel';

export class ItemRepository implements IItemRepository {
  private toDomain(document: ItemDocument): Item {
    return {
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      sort_order: document.sort_order,
      is_active: document.is_active,
      base_price: document.base_price,
      category_id: document.category_id
        ? (document.category_id as any)._id
          ? (document.category_id as any)._id.toString()
          : document.category_id.toString()
        : '',
      category:
        document.category_id && (document.category_id as any).name
          ? {
              id: (document.category_id as any)._id.toString(),
              name: (document.category_id as any).name,
            }
          : undefined,
      image: document.image,
      image_public_id: document.image_public_id,
      is_available: document.is_available,
      is_signature: document.is_signature,
      max_per_order: document.max_per_order,
      is_sizeable: document.is_sizeable,
      is_customizable: document.is_customizable,
      default_size_id: document.default_size_id
        ? typeof document.default_size_id === 'string'
          ? document.default_size_id
          : (document.default_size_id as any)?._id
            ? (document.default_size_id as any)._id.toString()
            : document.default_size_id.toString()
        : undefined,
      modifier_groups: document.modifier_groups
        ? document.modifier_groups.map((mg: any) => ({
            modifier_group_id:
              typeof mg.modifier_group_id === 'string'
                ? mg.modifier_group_id
                : (mg.modifier_group_id?._id || mg.modifier_group_id).toString(),
            display_order: mg.display_order || 0,
            modifier_overrides: mg.modifier_overrides
              ? mg.modifier_overrides.map((mo: any) => ({
                  modifier_id:
                    typeof mo.modifier_id === 'string'
                      ? mo.modifier_id
                      : (mo.modifier_id?._id || mo.modifier_id).toString(),
                  max_quantity: mo.max_quantity,
                  is_default: mo.is_default,
                  prices_by_size: mo.prices_by_size || undefined,
                  quantity_levels: mo.quantity_levels || undefined,
                }))
              : undefined,
          }))
        : [],
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(itemData: CreateItemDTO): Promise<Item> {
    const itemDoc = new ItemModel(itemData);
    await itemDoc.save();
    return this.toDomain(itemDoc);
  }

  async findById(id: string): Promise<Item | null> {
    const query: any = { _id: id };
    const itemDoc = await ItemModel.findOne(query)
      .populate('category_id')
      .populate('default_size_id')
      .populate('modifier_groups.modifier_group_id')
      .populate('modifier_groups.modifier_overrides.modifier_id');
    return itemDoc ? this.toDomain(itemDoc) : null;
  }

  async findAll(filters: ItemFilters): Promise<PaginatedItems> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = filters.orderBy || 'created_at';
    const sortedBy = filters.sortedBy === 'asc' ? 1 : -1;

    const query: any = {};

    if (filters.category_id) {
      query.category_id = filters.category_id;
    }

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters.is_available !== undefined) {
      query.is_available = filters.is_available;
    }

    if (filters.is_signature !== undefined) {
      query.is_signature = filters.is_signature;
    }

    // Search by name or description
    if (filters.search || filters.name) {
      const searchTerm = filters.search || filters.name;
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [itemDocs, total] = await Promise.all([
      ItemModel.find(query)
        .sort({ [orderBy]: sortedBy })
        .skip(skip)
        .limit(limit)
        .populate('category_id')
        .populate('default_size_id')
        .populate('modifier_groups.modifier_group_id')
        .populate('modifier_groups.modifier_overrides.modifier_id'),
      ItemModel.countDocuments(query),
    ]);

    return {
      items: itemDocs.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, itemData: UpdateItemDTO): Promise<Item> {
    const itemDoc = await ItemModel.findOneAndUpdate({ _id: id }, itemData, {
      new: true,
      runValidators: true,
    })
      .populate('category_id')
      .populate('default_size_id')
      .populate('modifier_groups.modifier_group_id')
      .populate('modifier_groups.modifier_overrides.modifier_id');

    if (!itemDoc) {
      throw new Error('Item not found');
    }

    return this.toDomain(itemDoc);
  }

  async delete(id: string): Promise<void> {
    await ItemModel.findOneAndDelete({ _id: id });
  }

  async assignModifierGroupsToCategoryItems(
    categoryId: string,
    modifierGroups: any[]
  ): Promise<void> {
    await ItemModel.updateMany({ category_id: categoryId }, { modifier_groups: modifierGroups });
  }

  async updateSortOrder(items: { id: string; order: number }[]): Promise<void> {
    if (!items || items.length === 0) return;

    const operations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sort_order: item.order },
      },
    }));

    await ItemModel.bulkWrite(operations);
  }
}
