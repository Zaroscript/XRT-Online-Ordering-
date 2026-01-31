import {
  Modifier,
  CreateModifierDTO,
  UpdateModifierDTO,
  ModifierFilters,
} from '../entities/Modifier';

export interface PaginatedModifiers {
  modifiers: Modifier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IModifierRepository {
  create(data: CreateModifierDTO): Promise<Modifier>;
  findById(id: string, modifier_group_id?: string): Promise<Modifier | null>;
  findAll(filters: ModifierFilters): Promise<Modifier[]>;
  findByGroupId(modifier_group_id: string): Promise<Modifier[]>;
  update(id: string, modifier_group_id: string, data: UpdateModifierDTO): Promise<Modifier>;
  delete(id: string, modifier_group_id: string): Promise<void>; // Soft delete
  exists(name: string, modifier_group_id: string, excludeId?: string): Promise<boolean>;
  findActiveById(id: string, modifier_group_id?: string): Promise<Modifier | null>;
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}
