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
  findById(id: string): Promise<Item | null>;
  findAll(filters: ItemFilters): Promise<PaginatedItems>;
  update(id: string, data: UpdateItemDTO): Promise<Item>;
  delete(id: string): Promise<void>;
  assignModifierGroupsToCategoryItems(categoryId: string, modifierGroups: any[]): Promise<void>;
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}
