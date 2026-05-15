import { ValidationError } from '../../shared/errors/AppError';
import { promotionAppliesOnWeekday } from '../../shared/utils/promotionWeekdays';
import type { Promotion } from '../entities/Promotion';
import type { PromotionRules } from '../entities/Promotion';

export interface CartLineInput {
  menu_item_id: string;
  quantity: number;
  line_subtotal: number;
}

export interface ApplyPromotionParams {
  promotion: Promotion;
  lines: CartLineInput[];
  /** Sum used for discount math — storefront sends base menu/size price only (modifiers excluded). */
  cartSubtotal: number;
  /** Full cart including modifiers — used for minimum spend checks. Defaults to cartSubtotal. */
  cartSubtotalForMinimum?: number;
  orderType: 'pickup' | 'delivery';
  deliveryFee: number;
  /** Business IANA timezone (e.g. America/New_York). Defaults to UTC. */
  businessTimeZone?: string;
}

export interface ApplyPromotionResult {
  discount: number;
  deliveryFeeAfter: number;
}

function unitPrice(line: CartLineInput): number {
  if (line.quantity <= 0) return 0;
  return line.line_subtotal / line.quantity;
}

/** Expand cart lines into per-unit entries sorted cheapest-first */
function sortedUnitsFromLines(lines: CartLineInput[], menuIds?: Set<string>): number[] {
  const units: number[] = [];
  for (const line of lines) {
    if (menuIds && !menuIds.has(line.menu_item_id)) continue;
    const u = unitPrice(line);
    for (let i = 0; i < line.quantity; i++) units.push(u);
  }
  units.sort((a, b) => a - b);
  return units;
}

function qtyByMenuItem(lines: CartLineInput[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const line of lines) {
    m.set(line.menu_item_id, (m.get(line.menu_item_id) || 0) + line.quantity);
  }
  return m;
}

function eligibleSubtotal(lines: CartLineInput[], ids: string[]): number {
  const set = new Set(ids);
  return lines.filter((l) => set.has(l.menu_item_id)).reduce((s, l) => s + l.line_subtotal, 0);
}

export function assertPromotionWindowAndLimits(promotion: Promotion): void {
  const now = new Date();
  const from = new Date(promotion.active_from);
  const to = new Date(promotion.expire_at);
  if (now < from || now > to) {
    throw new ValidationError('Promotion is not active at this time');
  }
  if (
    promotion.max_conversions != null &&
    promotion.orders.length >= promotion.max_conversions
  ) {
    throw new ValidationError('Promotion usage limit exceeded');
  }
}

export function assertPromotionWeekdayActive(
  promotion: Pick<Promotion, 'active_weekdays'>,
  timeZone: string,
  now: Date = new Date()
): void {
  const tz = (timeZone || 'UTC').trim() || 'UTC';
  if (promotionAppliesOnWeekday(promotion.active_weekdays ?? [], now, tz)) return;
  throw new ValidationError('This promotion is not available today');
}

export function applyPromotionToCart(params: ApplyPromotionParams): ApplyPromotionResult {
  const { promotion, lines, cartSubtotal, orderType, deliveryFee } = params;
  const minimumCheckSubtotal = params.cartSubtotalForMinimum ?? cartSubtotal;
  const rules = promotion.rules || {};
  const tz = (params.businessTimeZone || 'UTC').trim() || 'UTC';

  assertPromotionWindowAndLimits(promotion);
  assertPromotionWeekdayActive(promotion, tz);

  if (minimumCheckSubtotal < (promotion.minimum_cart_amount || 0)) {
    throw new ValidationError(
      `Minimum order for this promotion is ${promotion.minimum_cart_amount}`
    );
  }

  let discount = 0;
  let deliveryFeeAfter = deliveryFee;

  switch (promotion.template) {
    case 'percent_cart': {
      const pct = rules.percentage ?? 0;
      discount = (cartSubtotal * pct) / 100;
      break;
    }
    case 'fixed_cart': {
      const amt = rules.amount ?? 0;
      discount = Math.min(amt, cartSubtotal);
      break;
    }
    case 'free_delivery': {
      const allowed = rules.order_types;
      if (
        orderType === 'delivery' &&
        (!allowed ||
          allowed.length === 0 ||
          (allowed as string[]).includes('delivery'))
      ) {
        deliveryFeeAfter = 0;
      }
      discount = 0;
      break;
    }
    case 'percent_selected_items':
    case 'percent_combo': {
      const pct = rules.percentage ?? 0;
      const ids = rules.menu_item_ids || [];
      if (!ids.length) throw new ValidationError('Promotion has no eligible items configured');
      const sub = eligibleSubtotal(lines, ids);
      if (sub <= 0) throw new ValidationError('No eligible items in cart for this promotion');
      discount = (sub * pct) / 100;
      break;
    }
    case 'free_item': {
      const ids = rules.menu_item_ids || [];
      if (!ids.length) throw new ValidationError('Promotion has no eligible items configured');
      const freeQty = Math.max(1, rules.free_quantity ?? 1);
      const set = new Set(ids);
      const units = sortedUnitsFromLines(lines, set);
      if (units.length < freeQty) {
        throw new ValidationError('Not enough eligible items for this promotion');
      }
      discount = units.slice(0, freeQty).reduce((a, b) => a + b, 0);
      break;
    }
    case 'bogo':
      discount = computeBogoDiscount(lines, rules);
      break;
    case 'buy_n_get_one_free':
      discount = computeBuyNGetOneFree(lines, rules);
      break;
    case 'meal_bundle':
      discount = computeMealBundleDiscount(lines, rules);
      break;
    case 'linked_coupon':
      throw new ValidationError('Linked coupon promotions are resolved outside this calculator');
    default:
      throw new ValidationError('Unsupported promotion template');
  }

  discount = Math.min(Math.max(0, discount), cartSubtotal);

  return { discount, deliveryFeeAfter };
}

function computeBogoDiscount(lines: CartLineInput[], rules: PromotionRules): number {
  const pct = rules.discount_cheapest_percent ?? 100;
  const factor = pct / 100;

  const ga = rules.group_a_ids?.length ? rules.group_a_ids : undefined;
  const gb = rules.group_b_ids?.length ? rules.group_b_ids : undefined;

  if (ga && gb) {
    const qtyA = sortedUnitsFromLines(lines, new Set(ga)).length;
    const unitsB = sortedUnitsFromLines(lines, new Set(gb));
    const pairs = Math.min(qtyA, unitsB.length);
    if (pairs <= 0) throw new ValidationError('Cart does not qualify for this promotion');
    let disc = 0;
    for (let i = 0; i < pairs; i++) disc += unitsB[i] * factor;
    return disc;
  }

  const ids = rules.menu_item_ids?.length ? rules.menu_item_ids : [...(ga || []), ...(gb || [])];
  if (!ids.length) throw new ValidationError('Promotion has no eligible items configured');

  let total = 0;
  const counts = qtyByMenuItem(lines);
  for (const id of ids) {
    const q = counts.get(id) || 0;
    const pairs = Math.floor(q / 2);
    if (pairs <= 0) continue;
    const line = lines.find((l) => l.menu_item_id === id);
    if (!line) continue;
    total += pairs * unitPrice(line) * factor;
  }
  if (total <= 0) throw new ValidationError('Cart does not qualify for this promotion');
  return total;
}

function computeBuyNGetOneFree(lines: CartLineInput[], rules: PromotionRules): number {
  const n = rules.n ?? 2;
  const paidIds = rules.menu_item_ids || [];
  if (!paidIds.length) throw new ValidationError('Promotion has no eligible items configured');

  const paidSet = new Set(paidIds);
  let totalPaidQty = 0;
  for (const line of lines) {
    if (paidSet.has(line.menu_item_id)) totalPaidQty += line.quantity;
  }

  const denom = n + 1;
  const freeSlots = Math.floor(totalPaidQty / denom);
  if (freeSlots <= 0) throw new ValidationError('Cart does not qualify for this promotion');

  // If admin configured a separate free-reward item, discount that instead
  const freeIds = rules.group_b_ids?.length ? rules.group_b_ids : undefined;
  if (freeIds) {
    const freeSet = new Set(freeIds);
    const freeUnits = sortedUnitsFromLines(lines, freeSet);
    if (!freeUnits.length) throw new ValidationError('Free reward item is not in the cart');
    const redeemable = Math.min(freeSlots, freeUnits.length);
    return freeUnits.slice(0, redeemable).reduce((a, b) => a + b, 0);
  }

  // Fallback: cheapest of the paid items is free
  const units = sortedUnitsFromLines(lines, paidSet);
  return units.slice(0, freeSlots).reduce((a, b) => a + b, 0);
}

function computeMealBundleDiscount(lines: CartLineInput[], rules: PromotionRules): number {
  const bundlePrice = rules.bundle_price ?? 0;
  const components = rules.components || [];
  if (!components.length) throw new ValidationError('Meal bundle has no components configured');

  const counts = qtyByMenuItem(lines);
  let sets = Infinity;
  for (const c of components) {
    const have = counts.get(c.menu_item_id) || 0;
    sets = Math.min(sets, Math.floor(have / Math.max(1, c.min_quantity)));
  }
  if (!Number.isFinite(sets) || sets <= 0) {
    throw new ValidationError('Cart does not qualify for this bundle');
  }

  let fullRetail = 0;
  for (const c of components) {
    const perSetNeed = Math.max(1, c.min_quantity);
    const totalUnits = perSetNeed * sets;
    const pool = sortedUnitsFromLines(
      lines.filter((l) => l.menu_item_id === c.menu_item_id),
      undefined
    );
    if (pool.length < totalUnits) throw new ValidationError('Cart does not qualify for this bundle');
    fullRetail += pool.slice(0, totalUnits).reduce((a, b) => a + b, 0);
  }

  return Math.max(0, fullRetail - sets * bundlePrice);
}
