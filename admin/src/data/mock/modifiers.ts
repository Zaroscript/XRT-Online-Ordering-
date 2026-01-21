import { ModifierGroup, Modifier } from '@/types';

// Mock data for modifier groups
export const mockModifierGroups: ModifierGroup[] = [
  {
    id: 'mg_001',
    business_id: 'biz_001',
    name: 'Extra Toppings',
    display_type: 'CHECKBOX',
    min_select: 0,
    max_select: 5,
    is_active: true,
    sort_order: 1,
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 1.0 },
      { sizeCode: 'L', priceDelta: 2.0 },
    ],
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mg_002',
    business_id: 'biz_001',
    name: 'Sauce Selection',
    display_type: 'RADIO',
    min_select: 1,
    max_select: 1,
    is_active: true,
    sort_order: 2,
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mg_003',
    business_id: 'biz_001',
    name: 'Side Dishes',
    display_type: 'CHECKBOX',
    min_select: 0,
    max_select: 3,
    is_active: true,
    sort_order: 3,
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock data for modifiers
export const mockModifiers: Modifier[] = [
  // Modifiers for Extra Toppings (mg_001)
  {
    id: 'm_001',
    modifier_group_id: 'mg_001',
    name: 'Extra Cheese',
    quantity_levels: [
      { quantity: 1, price: 2.0 },
      { quantity: 2, price: 3.5 },
      { quantity: 3, price: 5.0 },
    ],
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 1.5 },
      { sizeCode: 'M', priceDelta: 2.0 },
      { sizeCode: 'L', priceDelta: 2.5 },
    ],
    is_active: true,
    sort_order: 1,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_002',
    modifier_group_id: 'mg_001',
    name: 'Mushrooms',
    quantity_levels: [
      { quantity: 1, price: 1.5 },
      { quantity: 2, price: 2.5 },
      { quantity: 3, price: 3.5 },
    ],
    prices_by_size: undefined,
    is_active: true,
    sort_order: 2,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_003',
    modifier_group_id: 'mg_001',
    name: 'Olives',
    quantity_levels: undefined,
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 1.0 },
      { sizeCode: 'M', priceDelta: 1.5 },
      { sizeCode: 'L', priceDelta: 2.0 },
    ],
    is_active: true,
    sort_order: 3,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Modifiers for Sauce Selection (mg_002)
  {
    id: 'm_004',
    modifier_group_id: 'mg_002',
    name: 'Marinara',
    quantity_levels: undefined,
    prices_by_size: undefined,
    is_active: true,
    sort_order: 1,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_005',
    modifier_group_id: 'mg_002',
    name: 'Alfredo',
    quantity_levels: undefined,
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 1.0 },
      { sizeCode: 'M', priceDelta: 1.5 },
      { sizeCode: 'L', priceDelta: 2.0 },
    ],
    is_active: true,
    sort_order: 2,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_006',
    modifier_group_id: 'mg_002',
    name: 'Pesto',
    quantity_levels: undefined,
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 1.5 },
      { sizeCode: 'M', priceDelta: 2.0 },
      { sizeCode: 'L', priceDelta: 2.5 },
    ],
    is_active: true,
    sort_order: 3,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Modifiers for Side Dishes (mg_003)
  {
    id: 'm_007',
    modifier_group_id: 'mg_003',
    name: 'French Fries',
    quantity_levels: undefined,
    prices_by_size: [
      { sizeCode: 'S', priceDelta: 3.0 },
      { sizeCode: 'M', priceDelta: 4.0 },
      { sizeCode: 'L', priceDelta: 5.0 },
    ],
    is_active: true,
    sort_order: 1,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_008',
    modifier_group_id: 'mg_003',
    name: 'Garlic Bread',
    quantity_levels: undefined,
    prices_by_size: undefined,
    is_active: true,
    sort_order: 2,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper function to get modifiers by group ID
export const getModifiersByGroupId = (groupId: string): Modifier[] => {
  return mockModifiers.filter((m) => m.modifier_group_id === groupId);
};

// Helper function to get modifier group with modifiers
export const getModifierGroupWithModifiers = (
  groupId: string,
): ModifierGroup | undefined => {
  const group = mockModifierGroups.find((g) => g.id === groupId);
  if (group) {
    return {
      ...group,
      modifiers: getModifiersByGroupId(groupId),
    };
  }
  return undefined;
};
