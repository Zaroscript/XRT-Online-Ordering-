import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order } from '../../entities/Order';

export interface GetOrdersFilters {
  status?: string;
  order_type?: string;
  page?: number;
  limit?: number;
  customer_id?: string;
  today_only?: boolean;
}

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(filters: GetOrdersFilters): Promise<{ data: Order[]; total: number }> {
    if (filters.customer_id) {
      return this.orderRepository.findByCustomerId(filters.customer_id, filters);
    }
    return this.orderRepository.findAll(filters);
  }
}
