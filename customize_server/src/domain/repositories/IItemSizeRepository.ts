import {
  ItemSize,
  CreateItemSizeDTO,
  UpdateItemSizeDTO,
  ItemSizeFilters,
} from '../entities/ItemSize';

export interface IItemSizeRepository {
  create(data: CreateItemSizeDTO): Promise<ItemSize>;
  findById(id: string): Promise<ItemSize | null>;
  findAll(filters: ItemSizeFilters): Promise<ItemSize[]>;
  update(id: string, data: UpdateItemSizeDTO): Promise<ItemSize>;
  delete(id: string): Promise<void>;
  exists(code: string, business_id: string, excludeId?: string): Promise<boolean>;
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}
