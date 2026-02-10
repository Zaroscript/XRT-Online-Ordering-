import {
  Item,
  ItemSizeConfig,
  ItemModifierAssignment,
  ItemModifierGroupAssignment,
} from '@/types';

// Default quantity levels for all modifiers
export const DEFAULT_QUANTITY_LEVELS = [
  { quantity: 1, name: 'Light' },
  { quantity: 2, name: 'Normal' },
  { quantity: 3, name: 'Extra' },
];

export type ItemFormProps = {
  initialValues?: Item | null;
  /** When creating from a page that already has shop context (e.g. create item page), pass so sizes can be managed immediately. */
  initialShopId?: string | null;
};

export type FormValues = {
  name: string;
  description?: string;
  base_price?: number; // Used ONLY if is_sizeable = false
  category: any;
  image?: any;
  sort_order?: number | null;
  is_max_per_order_unlimited?: boolean;
  max_per_order?: number;
  is_active?: boolean;
  is_available?: boolean;
  is_signature?: boolean;
  is_sizeable?: boolean;
  is_customizable?: boolean;
  default_size_id?: string | null; // FK to ItemSize.id, required if is_sizeable = true
  sizes?: ItemSizeConfig[]; // Updated to match Item structure
  modifier_groups?: ItemModifierGroupAssignment[]; // Updated to match backend
  modifier_assignment?: ItemModifierAssignment & {
    modifier_prices?: Record<string, number>;
    modifier_prices_by_quantity?: Record<string, Record<string, number>>;
    modifier_prices_by_size?: Record<string, Record<string, number>>;
    modifier_prices_by_size_and_quantity?: Record<
      string,
      Record<string, Record<string, number>>
    >;
    // Per-group pricing mode: 'inherit' uses group config, 'override' allows custom pricing
    pricing_mode?: { [groupId: string]: 'inherit' | 'override' };
  };
  apply_sides?: boolean;
  sides?: {
    both?: boolean;
    left?: boolean;
    right?: boolean;
  };
};

export const defaultFormValues: FormValues = {
  name: '',
  description: '',
  base_price: 0,
  category: null,
  image: '',
  sort_order: 0,
  is_max_per_order_unlimited: true,
  max_per_order: undefined,
  is_active: true,
  is_available: true,
  is_signature: false,
  is_sizeable: false,
  is_customizable: false,
  sizes: [],
  modifier_assignment: {
    modifier_groups: [],
    default_modifiers: [],
    assignment_scope: 'ITEM' as const,
  },
};
