import type { Promotion, PromotionTemplateId } from '@/types';
import type { PromotionFormValues } from './promotion-form-values';

export function parseIds(csv: string): string[] {
  return csv
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildPromotionRules(
  template: PromotionTemplateId,
  v: PromotionFormValues,
): Promotion['rules'] {
  switch (template) {
    case 'percent_cart':
      return { percentage: Number(v.percentage) || 0 };
    case 'percent_selected_items':
    case 'percent_combo':
      return {
        percentage: Number(v.percentage) || 0,
        menu_item_ids: parseIds(v.menu_item_ids_csv),
      };
    case 'fixed_cart':
      return { amount: Number(v.amount) || 0 };
    case 'free_delivery':
      return v.restrict_delivery_only
        ? { order_types: ['delivery'] as ('pickup' | 'delivery')[] }
        : {};
    case 'free_item':
      return {
        menu_item_ids: parseIds(v.menu_item_ids_csv),
        free_quantity: Math.max(1, Number(v.free_quantity) || 1),
      };
    case 'bogo': {
      const ga = parseIds(v.group_a_csv);
      const gb = parseIds(v.group_b_csv);
      const ids = parseIds(v.menu_item_ids_csv);
      const rules: Promotion['rules'] = {
        discount_cheapest_percent: Number(v.discount_cheapest_percent) ?? 100,
      };
      if (ga.length && gb.length) {
        rules.group_a_ids = ga;
        rules.group_b_ids = gb;
      } else if (ids.length) {
        rules.menu_item_ids = ids;
      }
      return rules;
    }
    case 'buy_n_get_one_free':
      return {
        n: Math.max(1, Number(v.n) || 2),
        menu_item_ids: parseIds(v.menu_item_ids_csv),
      };
    case 'meal_bundle': {
      const components = parseIds(v.menu_item_ids_csv).map((menuItemId) => ({
        menu_item_id: menuItemId,
        min_quantity: 1,
      }));
      return {
        bundle_price: Number(v.bundle_price) || 0,
        components,
      };
    }
    case 'linked_coupon':
      return {
        coupon_code: String(v.coupon_code || '').trim(),
      };
    default:
      return {};
  }
}
