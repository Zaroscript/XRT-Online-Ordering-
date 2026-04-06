export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'ADJUST';

export interface LoyaltyTransaction {
  id: string;
  loyalty_account_id: string;
  order_id?: string;
  type: LoyaltyTransactionType;
  points_change: number;   // positive = earn, negative = redeem
  points_balance_after: number;
  description: string;
  created_at: Date;
}
