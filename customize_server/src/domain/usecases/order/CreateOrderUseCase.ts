import { IOrderRepository } from '../../repositories/IOrderRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { CreateOrderDTO, Order, OrderItem } from '../../entities/Order';

import { IBusinessSettingsRepository } from '../../repositories/IBusinessSettingsRepository';
import { ICouponRepository } from '../../repositories/ICouponRepository';
import { IPromotionRepository } from '../../repositories/IPromotionRepository';
import { ICustomerRepository } from '../../repositories/ICustomerRepository';
import { BusinessRepository } from '../../../infrastructure/repositories/BusinessRepository';
import { LoyaltyService } from '../../services/LoyaltyService';
import { LoyaltyProgramRepository } from '../../../infrastructure/repositories/LoyaltyProgramRepository';
import { LoyaltyAccountRepository } from '../../../infrastructure/repositories/LoyaltyAccountRepository';
import { LoyaltyTransactionRepository } from '../../../infrastructure/repositories/LoyaltyTransactionRepository';
import { ValidationError } from '../../../shared/errors/AppError';
import {
  applyPromotionToCart,
  assertPromotionWindowAndLimits,
  assertPromotionWeekdayActive,
} from '../../services/PromotionApplicationService';
import {
  assertCouponMinimumCart,
  assertCouponScheduleAndUsage,
  computeCouponCartImpact,
  couponMatchesBusiness,
} from '../../services/couponApplyHelpers';

const KITCHEN_SECTION_UNASSIGNED = 'Unassigned';

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private itemRepository: IItemRepository,
    private categoryRepository: ICategoryRepository,
    private businessSettingsRepository: IBusinessSettingsRepository,
    private couponRepository: ICouponRepository,
    private promotionRepository: IPromotionRepository,
    private customerRepository: ICustomerRepository,
    private businessRepository: BusinessRepository
  ) {
    this.loyaltyService = new LoyaltyService(
      new LoyaltyProgramRepository(),
      new LoyaltyAccountRepository(),
      new LoyaltyTransactionRepository()
    );
  }

  private loyaltyService: LoyaltyService;

  /**
   * Resolve kitchen section name for a menu item via Item → Category → kitchen_section_data.
   * Uses cache to avoid repeated lookups for the same menu_item_id.
   */
  private async resolveKitchenSectionForItem(
    menuItemId: string,
    cache: Map<string, string>
  ): Promise<string> {
    const cached = cache.get(menuItemId);
    if (cached !== undefined) return cached;

    let sectionName = KITCHEN_SECTION_UNASSIGNED;
    try {
      const item = await this.itemRepository.findById(menuItemId);
      if (item?.category_id) {
        const category = await this.categoryRepository.findById(item.category_id);
        sectionName = category?.kitchen_section_data?.name ?? KITCHEN_SECTION_UNASSIGNED;
      }
    } catch {
      // Keep Unassigned on any lookup failure
    }
    cache.set(menuItemId, sectionName);
    return sectionName;
  }

  async execute(orderData: CreateOrderDTO): Promise<Order> {
    const sectionCache = new Map<string, string>();

    // 1. Resolve kitchen section and calculate line subtotals for each item
    const calculatedItems: (OrderItem & { modifier_totals: number; line_subtotal: number })[] = [];
    for (const item of orderData.items) {
      const modifierTotals = item.modifiers.reduce(
        (acc, mod) => acc + (mod.unit_price_delta || 0),
        0
      );
      const lineSubtotal = (item.unit_price + modifierTotals) * item.quantity;
      const kitchen_section_snapshot = await this.resolveKitchenSectionForItem(
        item.menu_item_id,
        sectionCache
      );
      calculatedItems.push({
        ...item,
        modifier_totals: modifierTotals,
        line_subtotal: lineSubtotal,
        kitchen_section_snapshot,
      });
    }

    // 2. Sum up subtotals (full cart vs base-only for promotions — modifiers excluded from discount pool)
    const computedSubtotal = calculatedItems.reduce((acc, item) => acc + item.line_subtotal, 0);
    const computedSubtotalBaseOnly = calculatedItems.reduce(
      (acc, item) => acc + Number(item.unit_price || 0) * Number(item.quantity || 0),
      0
    );

    let effectiveDeliveryFee = Number(orderData.money.delivery_fee || 0);

    const promoIdRaw = orderData.money.promotion_id;
    const promoId =
      typeof promoIdRaw === 'string' && promoIdRaw.trim() ? promoIdRaw.trim() : undefined;
    const couponCode =
      typeof orderData.money.coupon_code === 'string' && orderData.money.coupon_code.trim()
        ? orderData.money.coupon_code.trim()
        : undefined;

    const promotion = promoId ? await this.promotionRepository.findById(promoId) : null;

    if (promoId && couponCode) {
      const linkedOk =
        promotion?.template === 'linked_coupon' &&
        String((promotion.rules as { coupon_code?: string })?.coupon_code || '')
          .trim()
          .toLowerCase() === couponCode.toLowerCase();
      if (!linkedOk) {
        throw new ValidationError(
          'Only one promotion applies per order. Use website promotions, or a legacy coupon — not both.'
        );
      }
    }

    let verifiedDiscount = 0;
    let resolvedCouponCode: string | undefined;

    if (promoId) {
      if (!promotion || promotion.business_id !== orderData.business_id) {
        throw new ValidationError('Invalid promotion');
      }
      if (!promotion.is_active_on_website) {
        throw new ValidationError('Promotion is not available');
      }

      const biz = await this.businessRepository.findOne();
      const promoTz = biz?.timezone?.trim() || 'UTC';

      const cartLines = calculatedItems.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        line_subtotal: Number(item.unit_price || 0) * Number(item.quantity || 0),
      }));

      if (promotion.template === 'linked_coupon') {
        const code = String((promotion.rules as { coupon_code?: string })?.coupon_code || '').trim();
        if (!code) {
          throw new ValidationError('This promotion is missing a linked coupon code');
        }
        const coupon = await this.couponRepository.verify(code);
        if (!coupon || !couponMatchesBusiness(coupon, orderData.business_id)) {
          throw new ValidationError('Invalid promotion');
        }

        assertPromotionWindowAndLimits(promotion);
        assertPromotionWeekdayActive(promotion, promoTz);
        assertCouponScheduleAndUsage(coupon);

        const minCart = Math.max(
          promotion.minimum_cart_amount || 0,
          coupon.minimum_cart_amount || 0
        );
        if (computedSubtotal < minCart) {
          throw new ValidationError(`Minimum order for this promotion is ${minCart}`);
        }

        const impact = computeCouponCartImpact(
          coupon,
          computedSubtotalBaseOnly,
          orderData.order_type,
          effectiveDeliveryFee
        );
        verifiedDiscount = impact.discount;
        effectiveDeliveryFee = impact.deliveryFeeAfter;
        orderData.money.promotion_id = promoId;
        orderData.money.coupon_code = code;
        resolvedCouponCode = code;
      } else {
        const applied = applyPromotionToCart({
          promotion,
          lines: cartLines,
          cartSubtotal: computedSubtotalBaseOnly,
          cartSubtotalForMinimum: computedSubtotal,
          orderType: orderData.order_type,
          deliveryFee: effectiveDeliveryFee,
          businessTimeZone: promoTz,
        });

        verifiedDiscount = applied.discount;
        effectiveDeliveryFee = applied.deliveryFeeAfter;

        orderData.money.promotion_id = promoId;
        orderData.money.coupon_code = undefined;
        resolvedCouponCode = undefined;
      }
    } else if (couponCode) {
      const coupon = await this.couponRepository.verify(couponCode);
      if (!coupon || !couponMatchesBusiness(coupon, orderData.business_id)) {
        throw new ValidationError('Invalid or expired coupon');
      }

      assertCouponScheduleAndUsage(coupon);
      assertCouponMinimumCart(coupon, computedSubtotal);

      const impact = computeCouponCartImpact(
        coupon,
        computedSubtotalBaseOnly,
        orderData.order_type,
        effectiveDeliveryFee
      );
      verifiedDiscount = impact.discount;
      effectiveDeliveryFee = impact.deliveryFeeAfter;

      verifiedDiscount = Math.min(verifiedDiscount, computedSubtotalBaseOnly);
      orderData.money.coupon_code = couponCode;
      orderData.money.promotion_id = undefined;
      resolvedCouponCode = couponCode;
    }

    const rewardsPointsUsed = Math.floor(Number(orderData.money.rewards_points_used || 0));

    // 2.6 Validate Loyalty Points if requested
    let loyaltyDiscount = 0;
    if (rewardsPointsUsed > 0 && orderData.customer_id) {
      try {
        const { discount_value } =
          await this.loyaltyService.validateRedemptionWithSubtotal(
          orderData.customer_id,
          rewardsPointsUsed,
          computedSubtotal
        );
        loyaltyDiscount = discount_value;
      } catch (err: any) {
        throw new ValidationError(`Failed to apply loyalty points: ${err.message}`);
      }
    }

    // 3. Verify calculated vs provided total to ensure consistency
    const expectedTotal =
      computedSubtotal +
      effectiveDeliveryFee +
      orderData.money.tax_total +
      orderData.money.tips -
      verifiedDiscount -
      loyaltyDiscount;

    const sanitizedMoney = {
      ...orderData.money,
      subtotal: computedSubtotal,
      discount: verifiedDiscount,
      delivery_fee: effectiveDeliveryFee,
      loyalty_discount_amount: loyaltyDiscount,
      rewards_points_used: rewardsPointsUsed > 0 ? rewardsPointsUsed : undefined,
      total_amount: Math.max(0, expectedTotal),
      coupon_code: resolvedCouponCode,
      promotion_id: promoId || undefined,
    };

    // 4. Check for auto-accept settings and business ID consistency
    const sanitizedData: CreateOrderDTO = {
      ...orderData,
      money: sanitizedMoney,
      items: calculatedItems,
    };

    const order = await this.orderRepository.create(sanitizedData);

    if (promoId && order.id) {
      try {
        await this.promotionRepository.appendOrderId(promoId, order.id);
      } catch (e) {
        console.warn('[CreateOrderUseCase] Could not append promotion order ref:', e);
      }
    }

    // 5. Safely deduct loyalty points matching validation check
    if (rewardsPointsUsed > 0 && orderData.customer_id && order.id) {
      try {
        await this.loyaltyService.redeemPointsByCustomer(
          orderData.customer_id,
          rewardsPointsUsed,
          order.id
        );
      } catch (e: any) {
        // Keep order and loyalty ledger consistent on redemption failure.
        await this.orderRepository.delete(order.id);
        throw new ValidationError(`Failed to finalize loyalty redemption: ${e.message}`);
      }
    }

    const customerId =
      typeof order.customer_id === 'string'
        ? order.customer_id
        : order.customer_id != null
          ? String(order.customer_id)
          : '';
    if (customerId) {
      const at = order.created_at ? new Date(order.created_at) : new Date();
      try {
        await this.customerRepository.update(
          customerId,
          { last_order_at: at },
          order.business_id || undefined
        );
      } catch (e) {
        console.warn('[CreateOrderUseCase] Could not update customer last_order_at:', e);
      }
    }

    return order;
  }
}
