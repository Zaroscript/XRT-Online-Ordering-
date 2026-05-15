import type { PromotionTemplateId } from '@/types';

/** Visual / UX grouping only — add new groups here as you add templates */
export type PromotionTemplateCategoryId =
  | 'cart_discounts'
  | 'item_deals'
  | 'shipping'
  | 'bundles';

export interface PromotionTemplateCategoryMeta {
  id: PromotionTemplateCategoryId;
  title: string;
  description: string;
  color: string;
}

export const PROMOTION_TEMPLATE_CATEGORIES: PromotionTemplateCategoryMeta[] = [
  {
    id: 'cart_discounts',
    title: 'Order Discounts',
    description: 'Applied to the whole order based on total value.',
    color: '#1e40af', // Ebraj Blue
  },
  {
    id: 'item_deals',
    title: 'Item Deals',
    description: 'Specific products or categories on sale.',
    color: '#b45309', // Ebraj Gold
  },
  {
    id: 'shipping',
    title: 'Delivery',
    description: 'Free or discounted shipping rules.',
    color: '#1f2937', // Ebraj Dark
  },
  {
    id: 'bundles',
    title: 'Bundles & Gifts',
    description: 'Buy X get Y or package deals.',
    color: '#6b7280', // Ebraj Gray
  },
];

export interface PromotionTemplateDefinition {
  id: PromotionTemplateId;
  /** Short card title */
  title: string;
  /** One-line explanation for admins */
  summary: string;
  category: PromotionTemplateCategoryId;
  /** Keywords for future search/filter */
  tags?: string[];
  color?: string; // Optional override color
}

/**
 * Single registry for the creation wizard and docs.
 * Keep in sync with server `PROMOTION_TEMPLATES` when adding types.
 */
export const PROMOTION_TEMPLATE_DEFINITIONS: PromotionTemplateDefinition[] = [
  {
    id: 'percent_cart',
    title: '% off entire cart',
    summary: 'Give customers a percentage discount on their total order.',
    category: 'cart_discounts',
    tags: ['percentage', 'cart'],
  },
  {
    id: 'fixed_cart',
    title: 'Fixed amount off cart',
    summary: 'Give customers a fixed dollar amount off their total order.',
    category: 'cart_discounts',
    tags: ['fixed', 'cart'],
  },
  {
    id: 'linked_coupon',
    title: 'Linked coupon code',
    summary:
      'Show an offer card that applies an existing coupon code (configure under Coupon codes). One source of truth for discount math.',
    category: 'cart_discounts',
    tags: ['coupon', 'code'],
  },
  {
    id: 'percent_selected_items',
    title: '% off selected items',
    summary: 'Discount specific items like appetizers, drinks, or seasonal specials.',
    category: 'item_deals',
    tags: ['percentage', 'items'],
  },
  {
    id: 'percent_combo',
    title: '% off combo deal',
    summary: 'Offer a discount when customers buy specific sets of items together.',
    category: 'bundles',
    tags: ['combo', 'percentage'],
  },
  {
    id: 'free_item',
    title: 'Free item',
    summary: 'Reward customers with a free gift when they meet order requirements.',
    category: 'item_deals',
    tags: ['free', 'gift'],
  },
  {
    id: 'bogo',
    title: 'Buy one, get one',
    summary: 'Buy one, get one free or discounted. Can be the same item (Buy a Burger, get a Burger) or different items (Buy a Pizza, get a Drink).',
    category: 'item_deals',
    tags: ['bogo', 'pair'],
  },
  {
    id: 'buy_n_get_one_free',
    title: 'Buy N, get 1 free',
    summary: 'Perfect for bulk orders: Buy 3, get the 4th one free.',
    category: 'item_deals',
    tags: ['bulk', 'nth'],
  },
  {
    id: 'meal_bundle',
    title: 'Meal bundle price',
    summary: 'Create a fixed price for a complete meal (e.g., Burger + Side + Drink).',
    category: 'bundles',
    tags: ['bundle', 'fixed'],
  },
  {
    id: 'free_delivery',
    title: 'Free delivery',
    summary: 'Remove delivery charges to encourage larger orders.',
    category: 'shipping',
    tags: ['shipping', 'delivery'],
  },
];

const DEFINITION_MAP = new Map(
  PROMOTION_TEMPLATE_DEFINITIONS.map((d) => [d.id, d]),
);

export function getPromotionTemplateDefinition(
  id: PromotionTemplateId,
): PromotionTemplateDefinition | undefined {
  return DEFINITION_MAP.get(id);
}

export function isKnownPromotionTemplateParam(
  value: string | undefined,
): value is PromotionTemplateId {
  return !!value && DEFINITION_MAP.has(value as PromotionTemplateId);
}

export function templatesByCategory(): Record<
  PromotionTemplateCategoryId,
  PromotionTemplateDefinition[]
> {
  const acc = {
    cart_discounts: [] as PromotionTemplateDefinition[],
    item_deals: [] as PromotionTemplateDefinition[],
    shipping: [] as PromotionTemplateDefinition[],
    bundles: [] as PromotionTemplateDefinition[],
  };
  for (const d of PROMOTION_TEMPLATE_DEFINITIONS) {
    acc[d.category].push(d);
  }
  return acc;
}
