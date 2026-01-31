import { QuantityLevel, PricesBySize } from './ModifierGroup';

export interface Modifier {
  id: string;
  modifier_group_id: string;
  modifier_group?: {
    id: string;
    name: string;
  };
  name: string;
  display_order: number;
  is_active: boolean;
  sides_config?: {
    enabled: boolean;
    allowed_sides?: string[]; // Array of 'LEFT', 'RIGHT', 'WHOLE'
  };
  // Modifier-level configuration (overrides group defaults)
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft delete
}

export interface CreateModifierDTO {
  modifier_group_id: string;
  name: string;
  display_order?: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
  // Modifier-level configuration (overrides group defaults)
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
}

export interface UpdateModifierDTO {
  name?: string;
  display_order?: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
  // Modifier-level configuration (overrides group defaults)
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
}

export interface ModifierFilters {
  modifier_group_id?: string;
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
}
