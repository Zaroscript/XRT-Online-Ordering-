import moment from 'moment';
import { OrderModel } from '../../../infrastructure/database/models/OrderModel';
import { CouponModel } from '../../../infrastructure/database/models/CouponModel';

export type PromotionAlertTone = 'green' | 'red' | 'yellow';
export type PromotionStatus = 'active' | 'expiring' | 'paused';

export interface CouponTrendPoint {
  label: string;
  revenue: number;
  discount: number;
  previousRevenue: number;
  previousDiscount: number;
}

export interface CouponPerformanceRowDTO {
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

export interface TopCouponDTO {
  couponName: string;
  uses: number;
  revenue: number;
}

export interface CouponPerformanceAnalyticsDTO {
  rangeDays: 1 | 7 | 30 | 365;
  summary: {
    couponRevenueGenerated: number;
    netRevenueAfterDiscounts: number;
    newCustomersViaCoupons: number;
    aovWithCoupon: number;
    aovWithoutCoupon: number;
    couponOrdersCompleted: number;
    withoutCouponOrdersCompleted: number;
    totalDiscountCost: number;
    previous: {
      couponRevenueGenerated: number;
      netRevenueAfterDiscounts: number;
      newCustomersViaCoupons: number;
      aovWithCoupon: number;
      aovWithoutCoupon: number;
      couponOrdersCompleted: number;
      withoutCouponOrdersCompleted: number;
      totalDiscountCost: number;
    };
  };
  trend: CouponTrendPoint[];
  funnel: {
    viewed: number;
    applied: number;
    completed: number;
  };
  topCoupons: TopCouponDTO[];
  table: CouponPerformanceRowDTO[];
  alerts: Array<{ tone: PromotionAlertTone; text: string }>;
}

type RangeContext = {
  rangeDays: 1 | 7 | 30 | 365;
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  bucketMode: 'hour' | 'day' | 'month';
  labels: string[];
  currentKeys: string[];
  previousKeys: string[];
};

type CouponAggregateRow = {
  code: string;
  uses: number;
  revenue: number;
  discountCost: number;
  uniqueCustomers: number;
};

function normalizeRangeDays(value: number): 1 | 7 | 30 | 365 {
  if (value === 1 || value === 7 || value === 30 || value === 365) return value;
  return 1;
}

function normalizeCouponCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase();
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

export class CouponPerformanceAnalyticsService {
  async getByRange(rangeInput: number): Promise<CouponPerformanceAnalyticsDTO> {
    const range = this.buildRangeContext(rangeInput);

    const [
      summaryPair,
      trend,
      funnel,
      table,
      newCustomerCountsByCoupon,
      previousNewCustomerCountsByCoupon,
    ] = await Promise.all([
      this.getSummary(range),
      this.getTrend(range),
      this.getFunnel(range),
      this.getCouponTableRows(range),
      this.getFirstOrderCouponCounts(range.startDate, range.endDate),
      this.getFirstOrderCouponCounts(range.previousStartDate, range.previousEndDate),
    ]);
    const { current: summary, previous: previousSummary } = summaryPair;

    const tableWithNewCustomers = table.map((row) => {
      const key = normalizeCouponCode(row.code);
      const newCustomers = newCustomerCountsByCoupon.get(key) ?? 0;
      const netProfit = round2(row.revenue - row.discountCost);
      const roi = row.discountCost > 0 ? round2((netProfit / row.discountCost) * 100) : 0;
      return {
        couponName: row.code,
        type: row.type,
        uses: row.uses,
        revenue: row.revenue,
        discountCost: row.discountCost,
        netProfit,
        newCustomers,
        roi,
        status: row.status,
      } satisfies CouponPerformanceRowDTO;
    });

    const topCoupons = [...tableWithNewCustomers]
      .sort((a, b) => (b.uses !== a.uses ? b.uses - a.uses : b.revenue - a.revenue))
      .slice(0, 6)
      .map((item) => ({
        couponName: item.couponName,
        uses: item.uses,
        revenue: item.revenue,
      }));

    const alerts = this.buildAlerts(tableWithNewCustomers, summary, range);

    return {
      rangeDays: range.rangeDays,
      summary: {
        couponRevenueGenerated: summary.couponRevenueGenerated,
        netRevenueAfterDiscounts: summary.netRevenueAfterDiscounts,
        newCustomersViaCoupons: tableWithNewCustomers.reduce(
          (sum, row) => sum + row.newCustomers,
          0,
        ),
        aovWithCoupon: summary.aovWithCoupon,
        aovWithoutCoupon: summary.aovWithoutCoupon,
        couponOrdersCompleted: summary.couponOrdersCompleted,
        withoutCouponOrdersCompleted: summary.withoutCouponOrdersCompleted,
        totalDiscountCost: summary.totalDiscountCost,
        previous: {
          couponRevenueGenerated: previousSummary.couponRevenueGenerated,
          netRevenueAfterDiscounts: previousSummary.netRevenueAfterDiscounts,
          newCustomersViaCoupons: [...previousNewCustomerCountsByCoupon.values()].reduce(
            (sum, value) => sum + value,
            0,
          ),
          aovWithCoupon: previousSummary.aovWithCoupon,
          aovWithoutCoupon: previousSummary.aovWithoutCoupon,
          couponOrdersCompleted: previousSummary.couponOrdersCompleted,
          withoutCouponOrdersCompleted: previousSummary.withoutCouponOrdersCompleted,
          totalDiscountCost: previousSummary.totalDiscountCost,
        },
      },
      trend,
      funnel,
      topCoupons,
      table: tableWithNewCustomers,
      alerts,
    };
  }

  private buildRangeContext(rangeInput: number): RangeContext {
    const rangeDays = normalizeRangeDays(rangeInput);
    const endDate = moment().endOf('day');
    const startDate = moment(endDate).subtract(rangeDays - 1, 'days').startOf('day');
    const previousEndDate = moment(startDate).subtract(1, 'day').endOf('day');
    const previousStartDate = moment(previousEndDate).subtract(rangeDays - 1, 'days').startOf('day');

    const bucketMode: 'hour' | 'day' | 'month' =
      rangeDays === 1 ? 'hour' : rangeDays === 365 ? 'month' : 'day';

    if (bucketMode === 'hour') {
      const labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
      const keys = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
      return {
        rangeDays,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        previousStartDate: previousStartDate.toDate(),
        previousEndDate: previousEndDate.toDate(),
        bucketMode,
        labels,
        currentKeys: keys,
        previousKeys: keys,
      };
    }

    if (bucketMode === 'month') {
      const labels: string[] = [];
      const currentKeys: string[] = [];
      const previousKeys: string[] = [];

      for (let i = 0; i < 12; i += 1) {
        const current = moment(startDate).add(i, 'months').startOf('month');
        const previous = moment(previousStartDate).add(i, 'months').startOf('month');
        labels.push(current.format('MMM'));
        currentKeys.push(current.format('YYYY-MM'));
        previousKeys.push(previous.format('YYYY-MM'));
      }

      return {
        rangeDays,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        previousStartDate: previousStartDate.toDate(),
        previousEndDate: previousEndDate.toDate(),
        bucketMode,
        labels,
        currentKeys,
        previousKeys,
      };
    }

    const labels: string[] = [];
    const currentKeys: string[] = [];
    const previousKeys: string[] = [];
    for (let i = 0; i < rangeDays; i += 1) {
      const current = moment(startDate).add(i, 'days').startOf('day');
      const previous = moment(previousStartDate).add(i, 'days').startOf('day');
      labels.push(current.format('MMM DD'));
      currentKeys.push(current.format('YYYY-MM-DD'));
      previousKeys.push(previous.format('YYYY-MM-DD'));
    }

    return {
      rangeDays,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      previousStartDate: previousStartDate.toDate(),
      previousEndDate: previousEndDate.toDate(),
      bucketMode,
      labels,
      currentKeys,
      previousKeys,
    };
  }

  private async getSummary(range: RangeContext) {
    const [current, previous] = await Promise.all([
      this.getSummaryForWindow(range.startDate, range.endDate),
      this.getSummaryForWindow(range.previousStartDate, range.previousEndDate),
    ]);
    return { current, previous };
  }

  private async getSummaryForWindow(startDate: Date, endDate: Date) {
    const stats = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
      },
      {
        $addFields: {
          normalizedCouponCode: {
            $trim: { input: { $toUpper: { $ifNull: ['$money.coupon_code', ''] } } },
          },
        },
      },
      {
        $addFields: {
          hasCoupon: { $gt: [{ $strLenCP: '$normalizedCouponCode' }, 0] },
        },
      },
      {
        $group: {
          _id: null,
          withCouponRevenue: {
            $sum: {
              $cond: ['$hasCoupon', { $ifNull: ['$money.total_amount', 0] }, 0],
            },
          },
          withCouponDiscount: {
            $sum: {
              $cond: ['$hasCoupon', { $ifNull: ['$money.discount', 0] }, 0],
            },
          },
          withCouponCount: {
            $sum: { $cond: ['$hasCoupon', 1, 0] },
          },
          withoutCouponRevenue: {
            $sum: {
              $cond: ['$hasCoupon', 0, { $ifNull: ['$money.total_amount', 0] }],
            },
          },
          withoutCouponCount: {
            $sum: { $cond: ['$hasCoupon', 0, 1] },
          },
        },
      },
    ]);

    const all = stats[0] || {
      withCouponRevenue: 0,
      withCouponDiscount: 0,
      withCouponCount: 0,
      withoutCouponRevenue: 0,
      withoutCouponCount: 0,
    };

    const couponRevenueGenerated = round2(Number(all.withCouponRevenue || 0));
    const totalDiscountCost = round2(Number(all.withCouponDiscount || 0));
    const couponOrdersCompleted = Number(all.withCouponCount || 0);
    const withoutCouponOrdersCompleted = Number(all.withoutCouponCount || 0);

    return {
      couponRevenueGenerated,
      totalDiscountCost,
      couponOrdersCompleted,
      withoutCouponOrdersCompleted,
      netRevenueAfterDiscounts: round2(couponRevenueGenerated - totalDiscountCost),
      aovWithCoupon:
        all.withCouponCount > 0 ? round2(all.withCouponRevenue / all.withCouponCount) : 0,
      aovWithoutCoupon:
        all.withoutCouponCount > 0 ? round2(all.withoutCouponRevenue / all.withoutCouponCount) : 0,
    };
  }

  private getDateFormatForBucket(bucketMode: RangeContext['bucketMode']) {
    if (bucketMode === 'hour') return '%H';
    if (bucketMode === 'month') return '%Y-%m';
    return '%Y-%m-%d';
  }

  private async getTrend(range: RangeContext): Promise<CouponTrendPoint[]> {
    const format = this.getDateFormatForBucket(range.bucketMode);

    const [currentRows, previousRows] = await Promise.all([
      this.getTrendRows(range.startDate, range.endDate, format),
      this.getTrendRows(range.previousStartDate, range.previousEndDate, format),
    ]);

    const currentMap = new Map<string, { revenue: number; discount: number }>();
    const previousMap = new Map<string, { revenue: number; discount: number }>();
    currentRows.forEach((row) => currentMap.set(row.key, row));
    previousRows.forEach((row) => previousMap.set(row.key, row));

    return range.labels.map((label, index) => {
      const current = currentMap.get(range.currentKeys[index]) || { revenue: 0, discount: 0 };
      const previous = previousMap.get(range.previousKeys[index]) || { revenue: 0, discount: 0 };
      return {
        label,
        revenue: round2(current.revenue),
        discount: round2(current.discount),
        previousRevenue: round2(previous.revenue),
        previousDiscount: round2(previous.discount),
      };
    });
  }

  private async getTrendRows(startDate: Date, endDate: Date, dateFormat: string) {
    return OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
          status: 'completed',
          $expr: {
            $gt: [
              {
                $strLenCP: {
                  $trim: {
                    input: { $toUpper: { $ifNull: ['$money.coupon_code', ''] } },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$created_at',
            },
          },
          revenue: { $sum: { $ifNull: ['$money.total_amount', 0] } },
          discount: { $sum: { $ifNull: ['$money.discount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          key: '$_id',
          revenue: 1,
          discount: 1,
        },
      },
    ]);
  }

  private async getFunnel(range: RangeContext) {
    const rows = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: range.startDate, $lte: range.endDate },
          $expr: {
            $gt: [
              {
                $strLenCP: {
                  $trim: {
                    input: { $toUpper: { $ifNull: ['$money.coupon_code', ''] } },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          viewed: { $sum: 1 },
          applied: {
            $sum: {
              $cond: [{ $ne: ['$status', 'canceled'] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = rows[0] || { viewed: 0, applied: 0, completed: 0 };
    return {
      viewed: Number(result.viewed || 0),
      applied: Number(result.applied || 0),
      completed: Number(result.completed || 0),
    };
  }

  private async getCouponTableRows(range: RangeContext): Promise<
    Array<{
      code: string;
      type: string;
      uses: number;
      revenue: number;
      discountCost: number;
      uniqueCustomers: number;
      status: PromotionStatus;
    }>
  > {
    const usageRows = (await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: range.startDate, $lte: range.endDate },
          status: 'completed',
          $expr: {
            $gt: [
              {
                $strLenCP: {
                  $trim: {
                    input: { $toUpper: { $ifNull: ['$money.coupon_code', ''] } },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          code: { $trim: { input: { $toUpper: '$money.coupon_code' } } },
          customerId: '$customer_id',
          revenue: { $ifNull: ['$money.total_amount', 0] },
          discountCost: { $ifNull: ['$money.discount', 0] },
        },
      },
      { $match: { code: { $ne: '' } } },
      {
        $group: {
          _id: '$code',
          uses: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          discountCost: { $sum: '$discountCost' },
          customers: { $addToSet: '$customerId' },
        },
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          uses: 1,
          revenue: 1,
          discountCost: 1,
          uniqueCustomers: { $size: '$customers' },
        },
      },
      { $sort: { uses: -1, revenue: -1 } },
    ])) as CouponAggregateRow[];

    if (!usageRows.length) return [];

    const codeSet = usageRows.map((row) => row.code);
    const couponRows = await CouponModel.aggregate([
      {
        $project: {
          code: 1,
          type: 1,
          active_from: 1,
          expire_at: 1,
          is_approve: 1,
          normalizedCode: { $trim: { input: { $toUpper: '$code' } } },
        },
      },
      { $match: { normalizedCode: { $in: codeSet } } },
    ]);

    const now = moment();
    const couponMap = new Map<string, any>();
    couponRows.forEach((coupon) => couponMap.set(coupon.normalizedCode, coupon));

    return usageRows.map((row) => {
      const coupon = couponMap.get(row.code);
      let status: PromotionStatus = 'paused';
      if (coupon) {
        const start = moment(coupon.active_from).startOf('day');
        const end = moment(coupon.expire_at).endOf('day');
        if (coupon.is_approve && start.isValid() && end.isValid() && now.isBetween(start, end, undefined, '[]')) {
          const daysToExpire = end.diff(now, 'days');
          status = daysToExpire <= 3 ? 'expiring' : 'active';
        }
      }

      return {
        code: row.code,
        type: coupon?.type || 'unknown',
        uses: Number(row.uses || 0),
        revenue: round2(Number(row.revenue || 0)),
        discountCost: round2(Number(row.discountCost || 0)),
        uniqueCustomers: Number(row.uniqueCustomers || 0),
        status,
      };
    });
  }

  private async getFirstOrderCouponCounts(startDate: Date, endDate: Date) {
    const rows = await OrderModel.aggregate([
      { $match: { status: 'completed' } },
      { $sort: { customer_id: 1, created_at: 1 } },
      {
        $group: {
          _id: '$customer_id',
          firstOrderAt: { $first: '$created_at' },
          firstCouponCode: { $first: '$money.coupon_code' },
        },
      },
      {
        $project: {
          _id: 0,
          firstOrderAt: 1,
          firstCouponCode: {
            $trim: { input: { $toUpper: { $ifNull: ['$firstCouponCode', ''] } } },
          },
        },
      },
      {
        $match: {
          firstOrderAt: { $gte: startDate, $lte: endDate },
          firstCouponCode: { $ne: '' },
        },
      },
      {
        $group: {
          _id: '$firstCouponCode',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          count: 1,
        },
      },
    ]);

    const map = new Map<string, number>();
    rows.forEach((row) => map.set(row.code, Number(row.count || 0)));
    return map;
  }

  private buildAlerts(
    rows: CouponPerformanceRowDTO[],
    summary: {
      couponRevenueGenerated: number;
      netRevenueAfterDiscounts: number;
      couponOrdersCompleted: number;
      totalDiscountCost: number;
    },
    range: RangeContext,
  ) {
    if (!rows.length) {
      return [
        {
          tone: 'yellow' as const,
          text: 'No coupon activity for selected period.',
        },
      ];
    }

    const topRevenue = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
    const weakestRoi = [...rows].sort((a, b) => a.roi - b.roi)[0];
    const discountRatio =
      summary.couponRevenueGenerated > 0
        ? (summary.totalDiscountCost / summary.couponRevenueGenerated) * 100
        : 0;

    const periodLabel =
      range.rangeDays === 1
        ? 'today'
        : range.rangeDays === 7
          ? 'this week'
          : range.rangeDays === 30
            ? 'this month'
            : 'this year';

    return [
      {
        tone: 'green' as const,
        text: `${topRevenue.couponName} generated the highest coupon revenue ${periodLabel} (${topRevenue.revenue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}).`,
      },
      {
        tone: 'red' as const,
        text: `${weakestRoi.couponName} has the lowest ROI (${weakestRoi.roi.toFixed(
          1,
        )}%).`,
      },
      {
        tone: 'yellow' as const,
        text:
          summary.couponOrdersCompleted > 0
            ? `Discount cost is ${discountRatio.toFixed(1)}% of coupon revenue ${periodLabel}.`
            : 'No completed coupon orders in selected period.',
      },
    ];
  }
}
