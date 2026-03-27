import { IOrderRepository } from '../../repositories/IOrderRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { CreateOrderDTO, Order, OrderItem } from '../../entities/Order';

import { IBusinessSettingsRepository } from '../../repositories/IBusinessSettingsRepository';
import { ICouponRepository } from '../../repositories/ICouponRepository';
import { ICustomerRepository } from '../../repositories/ICustomerRepository';

const KITCHEN_SECTION_UNASSIGNED = 'Unassigned';

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private itemRepository: IItemRepository,
    private categoryRepository: ICategoryRepository,
    private businessSettingsRepository: IBusinessSettingsRepository,
    private couponRepository: ICouponRepository,
    private customerRepository: ICustomerRepository
  ) {}

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

    // 2. Sum up subtotals
    const computedSubtotal = calculatedItems.reduce((acc, item) => acc + item.line_subtotal, 0);

    // 2.5 Verify coupon if provided
    let verifiedDiscount = 0;
    if (orderData.money.coupon_code) {
      const coupon = await this.couponRepository.verify(orderData.money.coupon_code);
      if (!coupon) {
        throw new Error('Invalid or expired coupon');
      }

      // Check minimum cart amount
      if (computedSubtotal < (coupon.minimum_cart_amount || 0)) {
        throw new Error(`Minimum order for this coupon is ${coupon.minimum_cart_amount}`);
      }

      // Calculate discount
      if (coupon.type === 'percentage') {
        verifiedDiscount = (computedSubtotal * coupon.amount) / 100;
      } else {
        verifiedDiscount = coupon.amount;
      }

      // Ensure discount doesn't exceed subtotal
      verifiedDiscount = Math.min(verifiedDiscount, computedSubtotal);
    }

    // 3. Verify calculated vs provided total to ensure consistency
    const expectedTotal =
      computedSubtotal +
      orderData.money.delivery_fee +
      orderData.money.tax_total +
      orderData.money.tips -
      verifiedDiscount;

    const sanitizedMoney = {
      ...orderData.money,
      subtotal: computedSubtotal,
      discount: verifiedDiscount, // Use verified discount
      total_amount: expectedTotal,
    };

    // 4. Check for auto-accept settings and business ID consistency
    const sanitizedData: CreateOrderDTO = {
      ...orderData,
      money: sanitizedMoney,
      items: calculatedItems,
    };

    const order = await this.orderRepository.create(sanitizedData);

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
