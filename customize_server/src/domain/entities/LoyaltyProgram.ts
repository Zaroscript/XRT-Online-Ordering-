export interface LoyaltyProgram {
  id: string;
  is_active: boolean;
  earn_rate_points_per_currency: number;   // e.g. 1 -> 1 point per $1
  redeem_rate_currency_per_point: number;  // e.g. 0.05 -> $0.05 per point
  minimum_points_to_redeem: number;        // e.g. 50
  max_discount_percent_per_order: number;  // e.g. 50 -> max 50% off
  created_at: Date;
  updated_at: Date;
}

export interface UpsertLoyaltyProgramDTO {
  is_active: boolean;
  earn_rate_points_per_currency: number;
  redeem_rate_currency_per_point: number;
  minimum_points_to_redeem: number;
  max_discount_percent_per_order: number;
}
