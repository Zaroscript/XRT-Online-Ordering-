import {
  ModifierGroup,
  CreateModifierGroupDTO,
  UpdateModifierGroupDTO,
  ModifierGroupFilters,
} from '../entities/ModifierGroup';

export interface PaginatedModifierGroups {
  modifierGroups: ModifierGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IModifierGroupRepository {
  create(data: CreateModifierGroupDTO): Promise<ModifierGroup>;
  findById(id: string, business_id?: string): Promise<ModifierGroup | null>;
  findAll(filters: ModifierGroupFilters): Promise<PaginatedModifierGroups>;
  update(id: string, business_id: string, data: UpdateModifierGroupDTO): Promise<ModifierGroup>;
  delete(id: string, business_id: string): Promise<void>; // Soft delete
  exists(name: string, business_id: string, excludeId?: string): Promise<boolean>;
  isUsedByItems(modifierGroupId: string): Promise<boolean>;
  findActiveById(id: string, business_id?: string): Promise<ModifierGroup | null>;
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}
