/** Max promotions that can be toggled "on website" per business */
export const MAX_WEBSITE_PROMOTIONS = 4;

export const PROMOTION_TEMPLATES = [
  'percent_cart',
  'percent_selected_items',
  'free_delivery',
  'bogo',
  'fixed_cart',
  'free_item',
  'meal_bundle',
  'buy_n_get_one_free',
  'percent_combo',
  /** Wraps an existing coupon record; storefront applies via promotion_id only */
  'linked_coupon',
] as const;

export type PromotionTemplateId = (typeof PROMOTION_TEMPLATES)[number];
