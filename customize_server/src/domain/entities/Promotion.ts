import type { PromotionTemplateId } from '../../shared/constants/promotions';

export interface PromotionRules {
  /** percent_cart, percent_selected_items, percent_combo */
  percentage?: number;
  /** fixed_cart */
  amount?: number;
  /** selected templates */
  menu_item_ids?: string[];
  /** free_item */
  free_quantity?: number;
  /** buy_n_get_one_free */
  n?: number;
  /** meal_bundle */
  bundle_price?: number;
  components?: { menu_item_id: string; min_quantity: number }[];
  /** BOGO across two groups (optional second group); if only menu_item_ids, same-SKU BOGO */
  group_a_ids?: string[];
  group_b_ids?: string[];
  /** discount on cheaper BOGO unit (default 100) */
  discount_cheapest_percent?: number;
  /** free_delivery — restrict to delivery orders only when present */
  order_types?: ('pickup' | 'delivery')[];
  /** linked_coupon — must match Coupon.code in DB */
  coupon_code?: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  template: PromotionTemplateId;
  headline: string;
  description?: string;
  image_url?: string;
  rules: PromotionRules;
  active_from: string;
  expire_at: string;
  /**
   * If empty / omitted: promo can appear every day (in addition to date window).
   * Otherwise subset of 0–6 (Sun–Sat, JS convention), interpreted in business timezone.
   */
  active_weekdays: number[];
  minimum_cart_amount: number;
  max_conversions: number | null;
  is_active_on_website: boolean;
  sort_order: number;
  /** Label on storefront card CTA (default Redeem) */
  cta_label?: string;
  orders: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionDTO {
  business_id: string;
  template: PromotionTemplateId;
  headline: string;
  description?: string;
  image_url?: string;
  rules: PromotionRules;
  active_weekdays?: number[];
  active_from: string;
  expire_at: string;
  minimum_cart_amount?: number;
  max_conversions?: number | null;
  is_active_on_website?: boolean;
  sort_order?: number;
  cta_label?: string;
}

export interface UpdatePromotionDTO extends Partial<Omit<CreatePromotionDTO, 'business_id'>> {}
