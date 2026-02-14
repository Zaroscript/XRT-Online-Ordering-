import { ModifierGroup } from './ModifierGroup';
import { Modifier } from './Modifier';

export interface ItemModifierPriceOverride {
  sizeCode: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  priceDelta: number;
}

export interface ItemModifierQuantityLevelOverride {
  quantity: number;
  name?: string;
  price?: number;
  /** Per-size pricing when item is sizeable */
  prices_by_size?: ItemModifierPriceOverride[];
  is_default?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface ItemModifierOverride {
  modifier_id: string;
  /** Flat price for non-sizeable modifier (no quantity levels) */
  price?: number;
  prices_by_size?: ItemModifierPriceOverride[];
  quantity_levels?: ItemModifierQuantityLevelOverride[];
  is_default?: boolean;
}

export interface ItemModifierGroupAssignment {
  modifier_group_id: string;
  // Previously partial { name: string }, now allow full internal ModifierGroup for rich responses
  modifier_group?: ModifierGroup | { name: string };
  display_order: number;
  modifier_overrides?: ItemModifierOverride[];
  // List of Modifiers belonging to this group (fetched dynamically)
  modifiers?: Modifier[];
}

export interface ItemSizeConfig {
  size_id: string; // References ItemSize.id (Global Catalog)
  price: number;
  is_default: boolean;
  is_active: boolean;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  base_price: number; // Used if is_sizeable is false.
  sizes?: ItemSizeConfig[]; // New: Stores pricing per size
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  image?: string;
  image_public_id?: string;
  is_available: boolean;
  is_signature: boolean;
  max_per_order?: number;
  is_sizeable?: boolean;
  is_customizable?: boolean;
  default_size_id?: string; // KEEPING for backward compat or quick lookup, but sizes array has is_default
  modifier_groups?: ItemModifierGroupAssignment[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateItemDTO {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  base_price: number;
  category_id: string;
  image?: string;
  image_public_id?: string;
  is_available?: boolean;
  is_signature?: boolean;
  max_per_order?: number;
  is_sizeable?: boolean;
  is_customizable?: boolean;
  default_size_id?: string; // FK to ItemSize.id, nullable - only used when is_sizeable = true
  sizes?: ItemSizeConfig[];
  modifier_groups?: ItemModifierGroupAssignment[];
}

export interface UpdateItemDTO {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  base_price?: number;
  category_id?: string;
  image?: string;
  image_public_id?: string;
  is_available?: boolean;
  is_signature?: boolean;
  max_per_order?: number;
  is_sizeable?: boolean;
  is_customizable?: boolean;
  default_size_id?: string; // FK to ItemSize.id, nullable - only used when is_sizeable = true
  sizes?: ItemSizeConfig[];
  modifier_groups?: ItemModifierGroupAssignment[];
}

export interface ItemFilters {
  category_id?: string;
  is_active?: boolean;
  is_available?: boolean;
  is_signature?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
  name?: string;
}
