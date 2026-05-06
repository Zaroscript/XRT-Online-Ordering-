import type { Attachment, PromotionTemplateId } from '@/types';

/** Shared shape for promotion create/edit forms — rules UI reads/writes these flat fields */
export type PromotionFormValues = {
  template: PromotionTemplateId;
  headline: string;
  description: string;
  image_url: string;
  image: Attachment | null;
  minimum_cart_amount: number;
  max_conversions: number | '';
  is_active_on_website: boolean;
  sort_order: number;
  active_from: Date | string;
  expire_at: Date | string;
  percentage: number | '';
  amount: number | '';
  menu_item_ids_csv: string;
  free_quantity: number | '';
  n: number | '';
  bundle_price: number | '';
  group_a_csv: string;
  group_b_csv: string;
  discount_cheapest_percent: number | '';
  restrict_delivery_only: boolean;
  /** linked_coupon template — existing Coupon.code */
  coupon_code: string;
  /** Storefront card CTA (e.g. Redeem) */
  cta_label: string;
};

export const promotionFormDefaults: PromotionFormValues = {
  template: 'percent_cart',
  headline: '',
  description: '',
  image_url: '',
  image: null,
  minimum_cart_amount: 0,
  max_conversions: '',
  is_active_on_website: false,
  sort_order: 0,
  active_from: new Date(),
  // Default to 30 days from now, end of day
  expire_at: new Date(new Date().setHours(23, 59, 59, 999) + 30 * 24 * 60 * 60 * 1000),
  percentage: 0,
  amount: 0,
  menu_item_ids_csv: '',
  free_quantity: 1,
  n: 2,
  bundle_price: 0,
  group_a_csv: '',
  group_b_csv: '',
  discount_cheapest_percent: 100,
  restrict_delivery_only: false,
  coupon_code: '',
  cta_label: 'Redeem',
};
