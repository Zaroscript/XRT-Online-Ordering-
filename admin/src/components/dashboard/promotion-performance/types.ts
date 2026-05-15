export type PromotionStatus = 'active' | 'expiring' | 'paused';

export interface PromotionKpi {
  title: string;
  value?: string;
  trendLabel: string;
  trendValue: number;
  icon: 'revenue' | 'net' | 'customers' | 'aov';
  valueComparison?: {
    leftLabel: string;
    leftValue: string;
    leftMeta: string;
    rightLabel: string;
    rightValue: string;
    rightMeta: string;
  };
  badgeLabel?: string;
}

export interface PromotionFunnelData {
  viewed: number;
  applied: number;
  completed: number;
}

export interface RevenueDiscountPoint {
  label: string;
  revenue: number;
  discount: number;
  previousRevenue?: number;
  previousDiscount?: number;
}

export interface CouponPerformanceRow {
  couponName: string;
  type: string;
  uses: number;
  revenue: number;
  discountCost: number;
  netProfit: number;
  newCustomers: number;
  roi: number;
  status: PromotionStatus;
}

export interface SmartAlert {
  tone: 'green' | 'red' | 'yellow';
  text: string;
}
