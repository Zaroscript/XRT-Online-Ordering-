export enum PriceChangeType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}

export enum PriceValueType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum PriceChangeStatus {
  COMPLETED = 'COMPLETED',
  ROLLED_BACK = 'ROLLED_BACK',
  FAILED = 'FAILED', // Should not persist if transaction fails, but good to have
}

export enum PriceUpdateTarget {
  ITEMS = 'ITEMS',
  MODIFIERS = 'MODIFIERS',
}

export interface ItemPriceSnapshot {
  item_id: string;
  base_price: number;
  sizes: {
    size_id: string;
    price: number;
  }[];
}

export interface ModifierPriceSnapshot {
  modifier_id: string;
  quantity_levels: {
    quantity: number;
    price: number;
    name?: string;
  }[];
}

export interface PriceChangeHistory {
  id: string;
  business_id: string;
  admin_id: string; // ID of the user who performed the action
  type: PriceChangeType;
  value_type: PriceValueType;
  value: number; // The amount (e.g., 10 for 10% or 10.00)
  affected_items_count: number;
  snapshot: (ItemPriceSnapshot | ModifierPriceSnapshot)[]; // Full snapshot for rollback
  status: PriceChangeStatus;
  created_at: Date;
  updated_at: Date;
  rolled_back_at?: Date;
  rolled_back_by?: string;
  target?: PriceUpdateTarget;
}

export interface CreatePriceChangeHistoryDTO {
  business_id: string;
  admin_id: string;
  type: PriceChangeType;
  value_type: PriceValueType;
  value: number;
  snapshot: (ItemPriceSnapshot | ModifierPriceSnapshot)[];
  affected_items_count: number;
  target: PriceUpdateTarget;
}
