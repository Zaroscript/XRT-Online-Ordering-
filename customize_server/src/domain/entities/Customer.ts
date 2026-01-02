export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
  isActive: boolean;
  last_order_at?: Date;
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
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  rewards?: number;
  notes?: string;
  isActive?: boolean;
}

