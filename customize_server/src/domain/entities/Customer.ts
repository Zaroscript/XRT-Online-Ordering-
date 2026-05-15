export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phoneNumber: string;
  /** Authoritative current loyalty balance from LoyaltyAccount.points_balance */
  loyaltyPoints?: number;
  rewards?: number;
  notes?: string;
  isActive: boolean;
  opted_into_loyalty?: boolean;
  accepts_marketing_messages?: boolean;
  accepts_order_updates?: boolean;
  last_order_at?: Date;
  address?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerDTO {
  business_id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
  opted_into_loyalty?: boolean;
  accepts_marketing_messages?: boolean;
  accepts_order_updates?: boolean;
  address?: any;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  rewards?: number;
  notes?: string;
  isActive?: boolean;
  opted_into_loyalty?: boolean;
  accepts_marketing_messages?: boolean;
  accepts_order_updates?: boolean;
  address?: any;
  /** Set when a new order is placed (dashboard “Last order” column). */
  last_order_at?: Date;
}

