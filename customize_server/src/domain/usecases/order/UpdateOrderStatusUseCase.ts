import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order, UpdateOrderStatusDTO } from '../../entities/Order';
import { NotFoundError } from '../../../shared/errors/AppError';
import { LoyaltyService } from '../../services/LoyaltyService';
import { LoyaltyProgramRepository } from '../../../infrastructure/repositories/LoyaltyProgramRepository';
import { LoyaltyAccountRepository } from '../../../infrastructure/repositories/LoyaltyAccountRepository';
import { LoyaltyTransactionRepository } from '../../../infrastructure/repositories/LoyaltyTransactionRepository';

export class UpdateOrderStatusUseCase {
  private loyaltyService: LoyaltyService;

  constructor(private orderRepository: IOrderRepository) {
    this.loyaltyService = new LoyaltyService(
      new LoyaltyProgramRepository(),
      new LoyaltyAccountRepository(),
      new LoyaltyTransactionRepository()
    );
  }

  async execute(id: string, updateData: UpdateOrderStatusDTO): Promise<Order | null> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Order');
    }

    // Status transition validation can be injected here
    // e.g. prevents jumping from 'pending' directly to 'completed' without accepted

    const updatedOrder = await this.orderRepository.updateStatus(id, updateData);

    // If order is completed, try to earn points
    if (updatedOrder && updateData.status === 'completed' && existing.status !== 'completed') {
      if (updatedOrder.customer_id) {
        try {
          await this.loyaltyService.earnPoints(
              updatedOrder.customer_id,
              updatedOrder
          );
        } catch (e: any) {
           console.warn(`[UpdateOrderStatusUseCase] Failed to earn points for order ${updatedOrder.id}:`, e.message);
        }
      }
    }

    // If order is canceled, handling point refunds and clawback
    if (updatedOrder && updateData.status === 'canceled' && existing.status !== 'canceled') {
        if (updatedOrder.customer_id) {
           // 1. Refund redeemed points
           if (updatedOrder.money?.rewards_points_used && updatedOrder.money.rewards_points_used > 0) {
               try {
                  await this.loyaltyService.refundPoints(
                      updatedOrder.customer_id, 
                      updatedOrder.money.rewards_points_used, 
                      updatedOrder.id
                  );
               } catch (e: any) {
                  console.warn(`[UpdateOrderStatusUseCase] Failed to refund redeemed points for order ${updatedOrder.id}:`, e.message);
               }
           }

           // 2. Clawback earned points if it was previously marked as completed
           if (existing.status === 'completed') {
               try {
                  await this.loyaltyService.clawbackEarnedPoints(
                      updatedOrder.customer_id, 
                      updatedOrder
                  );
               } catch (e: any) {
                  console.warn(`[UpdateOrderStatusUseCase] Failed to clawback earned points for order ${updatedOrder.id}:`, e.message);
               }
           }
        }
    }

    return updatedOrder;
  }
}
