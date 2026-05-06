import type { Coupon } from '../entities/Coupon';
import { ValidationError } from '../../shared/errors/AppError';

/** Dates, approval, and max uses — does not check cart minimum */
export function assertCouponScheduleAndUsage(coupon: Coupon): void {
  const now = new Date();
  const activeFrom = new Date(coupon.active_from);
  const expireAt = new Date(coupon.expire_at);
  if (now < activeFrom || now > expireAt) {
    throw new ValidationError('Coupon is not active at this time');
  }
  if (!coupon.is_approve) {
    throw new ValidationError('Coupon is not approved');
  }
  if (
    coupon.max_conversions != null &&
    coupon.orders &&
    coupon.orders.length >= coupon.max_conversions
  ) {
    throw new ValidationError('Coupon usage limit exceeded');
  }
}

export function assertCouponMinimumCart(coupon: Coupon, cartSubtotal: number): void {
  const min = coupon.minimum_cart_amount || 0;
  if (cartSubtotal < min) {
    throw new ValidationError(`Minimum order for this coupon is ${min}`);
  }
}

/** Same math as legacy CreateOrder coupon branch */
export function computeCouponCartImpact(
  coupon: Coupon,
  cartSubtotal: number,
  orderType: 'pickup' | 'delivery',
  deliveryFee: number,
): { discount: number; deliveryFeeAfter: number } {
  let discount = 0;
  let deliveryFeeAfter = deliveryFee;

  if (coupon.type === 'free_shipping') {
    discount = 0;
    if (orderType === 'delivery') {
      deliveryFeeAfter = 0;
    }
  } else if (coupon.type === 'percentage') {
    discount = (cartSubtotal * coupon.amount) / 100;
  } else {
    discount = coupon.amount;
  }

  discount = Math.min(Math.max(0, discount), cartSubtotal);
  return { discount, deliveryFeeAfter };
}

export function couponMatchesBusiness(coupon: Coupon, businessId: string): boolean {
  if (!coupon.shop_id) return true;
  return String(coupon.shop_id).trim() === String(businessId).trim();
}
