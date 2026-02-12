export type ImportSessionStatus = 'draft' | 'validated' | 'confirmed' | 'discarded' | 'rolled_back';

export interface ImportValidationError {
  file: string;
  row: number;
  entity: string;
  field: string;
  message: string;
  value?: any;
}

export interface ImportValidationWarning {
  file: string;
  row: number;
  entity: string;
  field: string;
  message: string;
  value?: any;
}

export interface ParsedItemData {
  business_id: string;
  name: string;
  description?: string;
  base_price?: number;
  category_id?: string;
  category_name?: string;
  is_sizeable: boolean;
  is_customizable?: boolean;
  is_active?: boolean;
  is_available?: boolean;
  is_signature?: boolean;
  max_per_order?: number;
  sort_order?: number;
  default_size_code?: string;
  [key: string]: any; // Allow additional fields
}

export interface ParsedItemSizeData {
  item_name: string;
  item_category_name?: string;
  size_code: string;
  name: string;
  price: number;
  display_order?: number;
  is_active?: boolean;
  is_default?: boolean;
}

export interface ParsedModifierGroupData {
  group_key: string;
  business_id: string;
  name: string;
  display_name?: string;
  display_type: 'RADIO' | 'CHECKBOX';
  min_select: number;
  max_select: number;
  applies_per_quantity?: boolean;
  is_active?: boolean;
  sort_order?: number;
  quantity_levels?: Array<{
    quantity: number;
    name?: string;
    price?: number;
    is_default?: boolean;
    display_order?: number;
    is_active?: boolean;
  }>;
  prices_by_size?: Array<{
    sizeCode: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    priceDelta: number;
  }>;
}

export interface ParsedModifierData {
  group_key: string;
  modifier_key: string;
  name: string;
  is_default?: boolean;
  max_quantity?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface ParsedItemModifierOverrideData {
  item_name: string;
  item_category_name?: string;
  group_key: string;
  modifier_key: string;
  max_quantity?: number;
  is_default?: boolean;
  prices_by_size?: Array<{
    sizeCode: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    priceDelta: number;
  }>;
  quantity_levels?: Array<{
    quantity: number;
    name?: string;
    price?: number;
    is_default?: boolean;
    display_order?: number;
    is_active?: boolean;
  }>;
}

export interface ParsedCategoryData {
  business_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  kitchen_section_name?: string;
  modifier_groups?: string;
}

export interface ParsedImportData {
  categories: ParsedCategoryData[]; // Added
  items: ParsedItemData[];
  itemSizes: ParsedItemSizeData[];
  modifierGroups: ParsedModifierGroupData[];
  modifiers: ParsedModifierData[];
  itemModifierOverrides: ParsedItemModifierOverrideData[];
}

export interface RollbackOperation {
  entityType: 'category' | 'item' | 'modifier_group' | 'modifier' | 'item_size';
  action: 'create' | 'update';
  id: string; // ID of the entity
  previousData?: any; // Snapshot of data before update (null for create)
}

export interface ImportSession {
  id: string;
  user_id: string;
  business_id: string;
  status: ImportSessionStatus | 'rolled_back';
  parsedData: ParsedImportData;
  validationErrors: ImportValidationError[];
  validationWarnings: ImportValidationWarning[];
  originalFiles: string[]; // File names
  rollbackData?: RollbackOperation[]; // Operations to reverse
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateImportSessionDTO {
  user_id: string;
  business_id: string;
  parsedData: ParsedImportData;
  validationErrors: ImportValidationError[];
  validationWarnings: ImportValidationWarning[];
  originalFiles: string[];
}

export interface UpdateImportSessionDTO {
  status?: ImportSessionStatus;
  parsedData?: ParsedImportData;
  validationErrors?: ImportValidationError[];
  validationWarnings?: ImportValidationWarning[];
  originalFiles?: string[];
  rollbackData?: RollbackOperation[];
}
