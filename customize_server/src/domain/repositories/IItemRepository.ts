import { Item, CreateItemDTO, UpdateItemDTO, ItemFilters } from '../entities/Item';

export interface PaginatedItems {
    items: Item[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IItemRepository {
    create(itemQuery: CreateItemDTO): Promise<Item>;
    findById(id: string, business_id?: string): Promise<Item | null>;
    findAll(filters: ItemFilters): Promise<PaginatedItems>;
    update(id: string, business_id: string, data: UpdateItemDTO): Promise<Item>;
    delete(id: string, business_id: string): Promise<void>;
}
