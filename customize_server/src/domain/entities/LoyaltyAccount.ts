export interface LoyaltyAccount {
  id: string;
  customer_id: string;
  points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  customer?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  created_at: Date;
  updated_at: Date;
}
