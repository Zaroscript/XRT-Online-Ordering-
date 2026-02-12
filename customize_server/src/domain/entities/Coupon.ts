export interface Coupon {
  id: string;
  code: string;
  description?: string;
  orders?: any[];
  type: string;
  amount: number;
  active_from: string;
  expire_at: string;
  created_at: string;
  updated_at: string;
  target: boolean;
  shop_id?: string;
  is_approve: boolean;
  minimum_cart_amount: number;
  translated_languages?: string[];
  language?: string;
  max_conversions?: number | null;
}

export interface CreateCouponDTO {
  code: string;
  description?: string;
  type: string;
  amount: number;
  active_from: string;
  expire_at: string;
  target: boolean;
  shop_id?: string;
  minimum_cart_amount: number;
  language?: string;
  max_conversions?: number | null;
}

export interface UpdateCouponDTO {
  code?: string;
  description?: string;
  type?: string;
  amount?: number;
  active_from?: string;
  expire_at?: string;
  target?: boolean;
  shop_id?: string;
  minimum_cart_amount?: number;
  language?: string;
  is_approve?: boolean;
  max_conversions?: number | null;
}
