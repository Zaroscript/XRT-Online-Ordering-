import { Modifier } from './Modifier';

export type ModifierDisplayType = 'RADIO' | 'CHECKBOX';

export interface QuantityLevel {
  quantity: number;
  name?: string;
  price?: number;
  is_default?: boolean;
  display_order?: number;
  is_active?: boolean;
  prices_by_size?: PricesBySize[];
}

export interface PricesBySize {
  size_id?: string; // Reference to ItemSize.id (legacy)
  sizeCode?: string; // S, M, L, XL, XXL
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  business_id: string;
  name: string;
  display_name?: string; // User-friendly display name for landing page
  display_type: ModifierDisplayType;
  min_select: number;
  max_select: number;

  quantity_levels?: QuantityLevel[];
  modifiers?: Modifier[];
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft delete
}

export interface CreateModifierGroupDTO {
  business_id: string;
  name: string;
  display_name?: string; // User-friendly display name for landing page
  display_type: ModifierDisplayType;
  min_select: number;
  max_select: number;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[]; // Added missing field
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateModifierGroupDTO {
  name?: string;
  display_name?: string; // User-friendly display name for landing page
  display_type?: ModifierDisplayType;
  min_select?: number;
  max_select?: number;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[]; // Added missing field
  is_active?: boolean;
  sort_order?: number;
}

export interface ModifierGroupFilters {
  business_id?: string;
  name?: string;
  is_active?: boolean;
  display_type?: ModifierDisplayType;
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
}
