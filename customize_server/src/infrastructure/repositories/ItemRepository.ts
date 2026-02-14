import { IItemRepository, PaginatedItems } from '../../domain/repositories/IItemRepository';
import { Item, CreateItemDTO, UpdateItemDTO, ItemFilters } from '../../domain/entities/Item';
import { ItemModel, ItemDocument } from '../database/models/ItemModel';
import { ModifierModel } from '../database/models/ModifierModel';

export class ItemRepository implements IItemRepository {
  private toDomain(document: ItemDocument, allModifiers: any[] = []): Item {
    return {
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      sort_order: document.sort_order,
      is_active: document.is_active,
      base_price: document.base_price,
      sizes: document.sizes
        ? document.sizes
            .filter((s: any) => s && s.size_id) // Filter out invalid entries
            .map((s: any) => ({
              size_id:
                typeof s.size_id === 'string'
                  ? s.size_id
                  : (s.size_id?._id || s.size_id).toString(),
              name: s.size_id && typeof s.size_id === 'object' ? s.size_id.name : undefined,
              code: s.size_id && typeof s.size_id === 'object' ? s.size_id.code : undefined,
              price: s.price,
              is_default: s.is_default,
              is_active: s.is_active,
            }))
        : [],
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
        ? (document.modifier_groups as any[])
            .slice()
            .sort((a: any, b: any) => {
              // Match dashboard order: use modifier_group.sort_order when populated
              const gA = a.modifier_group_id && typeof a.modifier_group_id === 'object' ? a.modifier_group_id : null;
              const gB = b.modifier_group_id && typeof b.modifier_group_id === 'object' ? b.modifier_group_id : null;
              const sortA = gA ? (gA.sort_order ?? 0) : (a.display_order ?? 0);
              const sortB = gB ? (gB.sort_order ?? 0) : (b.display_order ?? 0);
              return sortA - sortB;
            })
            .map((mg: any) => {
            const groupId =
              typeof mg.modifier_group_id === 'string'
                ? mg.modifier_group_id
                : (mg.modifier_group_id?._id || mg.modifier_group_id).toString();

            // Map full Modifier Group data if populated
            let modifierGroupData = undefined;
            if (mg.modifier_group_id && typeof mg.modifier_group_id === 'object') {
              const g = mg.modifier_group_id;
              modifierGroupData = {
                id: g._id ? g._id.toString() : groupId,
                name: g.name,
                display_name: g.display_name,
                min_select: g.min_select,
                max_select: g.max_select,
                quantity_levels: Array.isArray(g.quantity_levels) ? g.quantity_levels : [],
                prices_by_size: Array.isArray(g.prices_by_size) ? g.prices_by_size : [],
                price: g.price != null ? g.price : undefined,
                display_type: g.display_type,
                business_id: g.business_id,
                sort_order: g.sort_order ?? 0,
              };
            }

            // Find modifiers for this group (sorted by display_order)
            const groupModifiers = allModifiers
              .filter((m: any) => {
                const mGroupId =
                  typeof m.modifier_group_id === 'object' && m.modifier_group_id._id
                    ? m.modifier_group_id._id.toString()
                    : m.modifier_group_id.toString();
                return mGroupId === groupId;
              })
              .slice()
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((m: any) => ({
                id: m._id.toString(),
                name: m.name,
                modifier_group_id: groupId,
                display_order: m.display_order,
                is_active: m.is_active,
                prices_by_size: Array.isArray(m.prices_by_size) ? m.prices_by_size : [],
                quantity_levels: Array.isArray(m.quantity_levels) ? m.quantity_levels : [],
                price: m.price != null ? m.price : undefined,
                sides_config: m.sides_config,
                created_at: m.created_at,
                updated_at: m.updated_at,
              }));

            return {
              modifier_group_id: groupId,
              modifier_group: modifierGroupData,
              display_order: mg.display_order || 0,
              modifier_overrides: mg.modifier_overrides
                ? mg.modifier_overrides.map((mo: any) => ({
                    modifier_id:
                      typeof mo.modifier_id === 'string'
                        ? mo.modifier_id
                        : (mo.modifier_id?._id || mo.modifier_id).toString(),
                    max_quantity: mo.max_quantity,
                    is_default: mo.is_default,
                    price: mo.price != null ? mo.price : undefined,
                    // Omit empty arrays so client can inherit from modifier/group
                    prices_by_size:
                      Array.isArray(mo.prices_by_size) && mo.prices_by_size.length > 0
                        ? mo.prices_by_size
                        : undefined,
                    quantity_levels:
                      Array.isArray(mo.quantity_levels) && mo.quantity_levels.length > 0
                        ? mo.quantity_levels.map((ql: any) => ({
                            quantity: ql.quantity,
                            name: ql.name,
                            price: ql.price,
                            prices_by_size:
                              Array.isArray(ql.prices_by_size) && ql.prices_by_size.length > 0
                                ? ql.prices_by_size
                                : undefined,
                            is_default: ql.is_default,
                            display_order: ql.display_order,
                            is_active: ql.is_active,
                          }))
                        : undefined,
                  }))
                : undefined,
              modifiers: groupModifiers,
            };
          })
        : [],
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(itemData: CreateItemDTO): Promise<Item> {
    const itemDoc = new ItemModel(itemData);
    await itemDoc.save();

    // Fetch modifiers for the new item's groups
    const groupIds = (itemDoc.modifier_groups || [])
      .map((mg: any) => mg.modifier_group_id)
      .filter(Boolean);

    const modifiers =
      groupIds.length > 0
        ? await ModifierModel.find({ modifier_group_id: { $in: groupIds }, is_active: true })
        : [];

    return this.toDomain(itemDoc, modifiers);
  }

  async findById(id: string): Promise<Item | null> {
    const query: any = { _id: id };
    const itemDoc = await ItemModel.findOne(query)
      .populate('category_id')
      .populate('sizes.size_id')
      .populate('default_size_id')
      .populate('modifier_groups.modifier_group_id')
      .populate('modifier_groups.modifier_overrides.modifier_id');

    if (!itemDoc) return null;

    // Fetch relevant modifiers
    const groupIds = (itemDoc.modifier_groups || [])
      .map((mg: any) => mg.modifier_group_id && (mg.modifier_group_id._id || mg.modifier_group_id))
      .filter(Boolean);

    const modifiers =
      groupIds.length > 0
        ? await ModifierModel.find({ modifier_group_id: { $in: groupIds }, is_active: true })
        : [];

    return this.toDomain(itemDoc, modifiers);
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
        .limit(limit)
        .populate('category_id')
        .populate('sizes.size_id')
        .populate('default_size_id')
        .populate('modifier_groups.modifier_group_id')
        .populate('modifier_groups.modifier_overrides.modifier_id'),
      ItemModel.countDocuments(query),
    ]);

    // Optimize: Collect all group IDs to fetch modifiers in one query
    const allGroupIds = new Set<string>();
    itemDocs.forEach((doc) => {
      if (doc.modifier_groups) {
        doc.modifier_groups.forEach((mg: any) => {
          if (mg.modifier_group_id) {
            const gid = mg.modifier_group_id._id
              ? mg.modifier_group_id._id.toString()
              : mg.modifier_group_id.toString();
            allGroupIds.add(gid);
          }
        });
      }
    });

    const allModifiers =
      allGroupIds.size > 0
        ? await ModifierModel.find({
            modifier_group_id: { $in: Array.from(allGroupIds) },
            is_active: true,
          })
        : [];

    return {
      items: itemDocs.map((doc) => this.toDomain(doc, allModifiers)),
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
      .populate('sizes.size_id')
      .populate('default_size_id')
      .populate('modifier_groups.modifier_group_id')
      .populate('modifier_groups.modifier_overrides.modifier_id');

    if (!itemDoc) {
      throw new Error('Item not found');
    }

    // Fetch modifiers
    const groupIds = (itemDoc.modifier_groups || [])
      .map((mg: any) => mg.modifier_group_id && (mg.modifier_group_id._id || mg.modifier_group_id))
      .filter(Boolean);

    const modifiers =
      groupIds.length > 0
        ? await ModifierModel.find({ modifier_group_id: { $in: groupIds }, is_active: true })
        : [];

    return this.toDomain(itemDoc, modifiers);
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
