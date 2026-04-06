import { LoyaltyAccount } from '../entities/LoyaltyAccount';

export interface ILoyaltyAccountRepository {
  findByCustomerId(customer_id: string): Promise<LoyaltyAccount | null>;
  findByPhone(phone: string): Promise<LoyaltyAccount | null>;
  upsertForCustomer(customer_id: string): Promise<LoyaltyAccount>;
  updateBalance(id: string, delta: number, totalsUpdate: { earned?: number; redeemed?: number }): Promise<LoyaltyAccount>;
  list(pagination: { page: number; limit: number; search?: string }): Promise<{ data: any[]; total: number }>;
}
