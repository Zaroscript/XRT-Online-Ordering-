import { LoyaltyTransaction } from '../entities/LoyaltyTransaction';

export interface ILoyaltyTransactionRepository {
  create(data: Omit<LoyaltyTransaction, 'id' | 'created_at'>): Promise<LoyaltyTransaction>;
  listByAccount(loyalty_account_id: string, pagination: { page: number; limit: number }): Promise<{ data: LoyaltyTransaction[]; total: number }>;
  findByOrderIdAndType(order_id: string, type: 'EARN' | 'REDEEM' | 'REFUND' | 'CLAWBACK'): Promise<LoyaltyTransaction | null>;
}
