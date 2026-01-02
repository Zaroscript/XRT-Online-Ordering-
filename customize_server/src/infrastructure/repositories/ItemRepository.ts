import { IItemRepository, PaginatedItems } from '../../domain/repositories/IItemRepository';
import {
    Item,
    CreateItemDTO,
    UpdateItemDTO,
    ItemFilters,
} from '../../domain/entities/Item';
import { ItemModel, ItemDocument } from '../database/models/ItemModel';

export class ItemRepository implements IItemRepository {
    private toDomain(document: ItemDocument): Item {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            description: document.description,
            sort_order: document.sort_order,
            is_active: document.is_active,
            base_price: document.base_price,
            category_id: document.category_id
                ? ((document.category_id as any)._id
                    ? (document.category_id as any)._id.toString()
                    : document.category_id.toString())
                : '',
            category: (document.category_id && (document.category_id as any).name) ? {
                id: (document.category_id as any)._id.toString(),
                name: (document.category_id as any).name
            } : undefined,
            image: document.image,
            image_public_id: document.image_public_id,
            is_available: document.is_available,
            is_signature: document.is_signature,
            max_per_order: document.max_per_order,
            is_sizeable: document.is_sizeable,
            is_customizable: document.is_customizable,
            sizes: document.sizes || [],
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }

    async create(itemData: CreateItemDTO): Promise<Item> {
        const itemDoc = new ItemModel(itemData);
        await itemDoc.save();
        return this.toDomain(itemDoc);
    }

    async findById(id: string, business_id?: string): Promise<Item | null> {
        const query: any = { _id: id };
        if (business_id) {
            query.business_id = business_id;
        }
        const itemDoc = await ItemModel.findOne(query).populate('category_id');
        return itemDoc ? this.toDomain(itemDoc) : null;
    }

    async findAll(filters: ItemFilters): Promise<PaginatedItems> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const orderBy = filters.orderBy || 'created_at';
        const sortedBy = filters.sortedBy === 'asc' ? 1 : -1;

        const query: any = {};

        if (filters.business_id) {
            query.business_id = filters.business_id;
        }

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
                .populate('category_id'),
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

    async update(
        id: string,
        business_id: string,
        itemData: UpdateItemDTO
    ): Promise<Item> {
        const itemDoc = await ItemModel.findOneAndUpdate(
            { _id: id, business_id },
            itemData,
            {
                new: true,
                runValidators: true,
            }
        ).populate('category_id');

        if (!itemDoc) {
            throw new Error('Item not found');
        }

        return this.toDomain(itemDoc);
    }

    async delete(id: string, business_id: string): Promise<void> {
        await ItemModel.findOneAndDelete({ _id: id, business_id });
    }
}
