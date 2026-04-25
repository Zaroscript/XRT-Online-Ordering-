import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { BusinessModel } from '../../infrastructure/database/models/BusinessModel';
import { ItemModel } from '../../infrastructure/database/models/ItemModel';
import { CouponModel } from '../../infrastructure/database/models/CouponModel';
import moment from 'moment';
import { CouponPerformanceAnalyticsService } from '../services/analytics/CouponPerformanceAnalyticsService';

interface ActiveCouponDetail {
  code: string;
  description?: string;
  type: string;
  amount: number;
  activeFrom: string;
  expireAt: string;
  minimumCartAmount: number;
  maxConversions: number | null;
  isApproved: boolean;
  usageCount: number;
  uniqueCustomers: number;
  totalDiscount: number;
}

export class AnalyticsController {
  private readonly couponPerformanceService = new CouponPerformanceAnalyticsService();

  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const granularity = String(req.query.granularity || '').toLowerCase().trim();
    if (granularity) {
      if (granularity === 'hour') {
        const hourlySales = await this.getTodaySaleByHour();
        return sendSuccess(res, 'Hourly analytics retrieved', {
          salesHistory: {
            custom: hourlySales,
          },
        });
      }

      if (granularity === 'weekday') {
        const weekdaySales = await this.getWeekdaySaleBreakdown();
        return sendSuccess(res, 'Weekly analytics retrieved', {
          salesHistory: {
            custom: weekdaySales,
          },
        });
      }

      if (granularity === 'month') {
        const selectedYear = Number(req.query.year || moment().year());
        const year = Number.isFinite(selectedYear) && selectedYear > 1970
          ? selectedYear
          : moment().year();
        const monthlyByYear = await this.getMonthlySaleBreakdownForYear(year);
        return sendSuccess(res, 'Monthly analytics retrieved', {
          salesHistory: {
            custom: monthlyByYear,
          },
          meta: { year },
        });
      }

      if (granularity === 'year') {
        const yearsRangeRaw = String(req.query.years_range || '').toLowerCase().trim();
        const yearsRangeNumber = Number(req.query.years_range);
        const yearsRange =
          yearsRangeRaw === 'all'
            ? undefined
            : Number.isFinite(yearsRangeNumber) && yearsRangeNumber > 0
              ? yearsRangeNumber
              : 5;
        const yearlySeries = await this.getYearlySaleBreakdownByYear(yearsRange);
        return sendSuccess(res, 'Yearly analytics retrieved', {
          salesHistory: {
            custom: yearlySeries,
          },
          meta: {
            years_range: yearsRangeRaw === 'all' ? 'all' : yearsRange,
          },
        });
      }
    }

    const startOfToday = moment().startOf('day').toDate();
    const startOfWeek = moment().subtract(6, 'days').startOf('day').toDate();
    const startOfMonth = moment().subtract(29, 'days').startOf('day').toDate();
    const startOfYear = moment().startOf('year').toDate();

    const [
      todayStats,
      weeklyStats,
      monthlyStats,
      yearlyStats,
      allTimeStats,
      totalShops,
      todaySales,
      weeklySales,
      monthlySales,
      yearlySales,
      totalRefunds,
      todayActiveCouponDetails,
      weeklyActiveCouponDetails,
      monthlyActiveCouponDetails,
      yearlyActiveCouponDetails,
    ] = await Promise.all([
      this.getStatsForRange(startOfToday),
      this.getStatsForRange(startOfWeek),      // rolling 7 days — matches salesHistory.weekly
      this.getStatsForRange(startOfMonth),     // rolling 30 days — matches salesHistory.monthly
      this.getStatsForRange(startOfYear),
      this.getStatsForRange(new Date(0)),
      BusinessModel.countDocuments().exec(),
      this.getTodaySaleByHour(),
      this.getSaleBreakdownByRange(startOfWeek, 'day'),
      this.getSaleBreakdownByRange(startOfMonth, 'day'),
      this.getYearlySaleBreakdown(),
      this.getTotalRefunds(),
      this.getActiveCouponDetailsForRange(startOfToday),
      this.getActiveCouponDetailsForRange(startOfWeek),
      this.getActiveCouponDetailsForRange(startOfMonth),
      this.getActiveCouponDetailsForRange(startOfYear),
    ]);

    const response = {
      totalShops,
      todayTotalOrderByStatus: todayStats.statusStats,
      weeklyTotalOrderByStatus: weeklyStats.statusStats,
      monthlyTotalOrderByStatus: monthlyStats.statusStats,
      yearlyTotalOrderByStatus: yearlyStats.statusStats,
      
      todayStats: todayStats.summary,
      weeklyStats: weeklyStats.summary,
      monthlyStats: monthlyStats.summary,
      yearlyStats: yearlyStats.summary,
      allTimeStats: allTimeStats.summary,

      salesHistory: {
        today: todaySales,
        weekly: weeklySales,
        monthly: monthlySales,
        yearly: yearlySales
      },
      activeCouponDetails: {
        today: todayActiveCouponDetails,
        weekly: weeklyActiveCouponDetails,
        monthly: monthlyActiveCouponDetails,
        yearly: yearlyActiveCouponDetails,
      },

      totalYearSaleByMonth: yearlySales,
      totalRevenue: allTimeStats.summary.totalRevenue,
      todaysRevenue: todayStats.summary.totalRevenue,
      totalRefunds,
    };

    const customStartStr = req.query.start_date as string;
    const customEndStr = req.query.end_date as string;

    if (customStartStr && customEndStr) {
      const customStart = moment(customStartStr).startOf('day').toDate();
      const customEnd = moment(customEndStr).endOf('day').toDate();
      
      const customSales = await this.getSaleBreakdownByRange(customStart, 'day', customEnd);

      return sendSuccess(res, 'Custom Analytics retrieved', {
        salesHistory: {
          custom: customSales
        }
      });
    }

    return sendSuccess(res, 'Analytics retrieved successfully', response);
  });

  getCouponPerformance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const rangeDays = Number(req.query.range_days || 1);
    const data = await this.couponPerformanceService.getByRange(rangeDays);
    return sendSuccess(res, 'Coupon performance analytics retrieved successfully', data);
  });

  getPopularItems = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get total active item count so we can split into two non-overlapping halves
    const totalItems = await ItemModel.countDocuments({ is_active: true });
    const topHalfLimit = Math.ceil(totalItems / 2);
    const effectiveLimit = Math.min(limit, topHalfLimit);

    const popularItems = await ItemModel.aggregate([
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'orders',
          let: { itemId: '$_id' },
          pipeline: [
            { $match: { status: 'completed' } },
            { $unwind: '$items' },
            { $match: { $expr: { $eq: ['$items.menu_item_id', '$$itemId'] } } }
          ],
          as: 'orderItems'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          description: 1,
          price: '$base_price',
          sale_price: '$base_price',
          image: 1,
          type: { name: 'Item' },
          product_type: 'simple',
          orders_count: { $sum: '$orderItems.items.quantity' }
        }
      },
      // Sort descending: highest sales first
      { $sort: { orders_count: -1 } },
      // Take only the TOP half — guaranteed no overlap with less-sold
      { $limit: effectiveLimit }
    ]);

    return sendSuccess(res, 'Popular items retrieved', popularItems);
  });

  getLessSoldItems = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    // Mirror of getPopularItems: skip the top half, take the bottom half only
    const totalItems = await ItemModel.countDocuments({ is_active: true });
    const topHalfCount = Math.ceil(totalItems / 2);
    const bottomHalfCount = totalItems - topHalfCount;
    const effectiveLimit = Math.min(limit, bottomHalfCount);

    const lessSoldItems = await ItemModel.aggregate([
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'orders',
          let: { itemId: '$_id' },
          pipeline: [
            { $match: { status: 'completed' } },
            { $unwind: '$items' },
            { $match: { $expr: { $eq: ['$items.menu_item_id', '$$itemId'] } } }
          ],
          as: 'orderItems'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          description: 1,
          price: '$base_price',
          sale_price: '$base_price',
          image: 1,
          type: { name: 'Item' },
          product_type: 'simple',
          orders_count: { $sum: '$orderItems.items.quantity' }
        }
      },
      // Sort descending so $skip correctly skips the top performers
      { $sort: { orders_count: -1 } },
      // Skip the top half (those are in the Most Sold list)
      { $skip: topHalfCount },
      // Take only from the bottom half — guaranteed no overlap with most-sold
      { $limit: effectiveLimit }
    ]);

    return sendSuccess(res, 'Less sold items retrieved', lessSoldItems);
  });


  private async getStatsForRange(startDate: Date, endDate?: Date) {
    const matchQuery: any = { created_at: { $gte: startDate } };
    if (endDate) {
      matchQuery.created_at.$lte = endDate;
    }

    const stats = await OrderModel.aggregate([
      {
        $match: matchQuery
      },
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                total: { $sum: '$money.total_amount' }
              }
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: 1,
                total: { $round: ['$total', 2] }
              }
            }
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { 
                  $sum: { 
                    $cond: [{ $eq: ['$status', 'completed'] }, '$money.total_amount', 0] 
                  } 
                },
                totalTips: { $sum: '$money.tips' },
                totalOrders: { $sum: 1 },
                completedOrders: { 
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
                },
                canceledOrders: { 
                  $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } 
                },
                pickupOrders: {
                  $sum: { $cond: [{ $eq: ['$order_type', 'pickup'] }, 1, 0] }
                },
                deliveryOrders: {
                  $sum: { $cond: [{ $eq: ['$order_type', 'delivery'] }, 1, 0] }
                },
                totalDiscounts: { $sum: '$money.discount' },
                couponUsage: {
                  $sum: {
                    $cond: [
                      { 
                        $and: [
                          { $eq: ['$status', 'completed'] },
                          { $ne: ['$money.coupon_code', null] },
                          { $ne: ['$money.coupon_code', ''] }
                        ] 
                      }, 
                      1, 
                      0
                    ]
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                totalRevenue: { $round: ['$totalRevenue', 2] },
                totalTips: { $round: ['$totalTips', 2] },
                totalOrders: 1,
                completedOrders: 1,
                canceledOrders: 1,
                pickupOrders: 1,
                deliveryOrders: 1,
                totalDiscounts: { $round: ['$totalDiscounts', 2] },
                couponUsage: 1,
                aov: { 
                  $round: [
                    {
                      $cond: [
                        { $gt: ['$completedOrders', 0] },
                        { $divide: ['$totalRevenue', '$completedOrders'] },
                        0
                      ]
                    }, 
                    2
                  ] 
                }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    return {
      statusStats: result.statusStats,
      summary: result.summary[0] || {
        totalRevenue: 0,
        totalTips: 0,
        totalOrders: 0,
        completedOrders: 0,
        canceledOrders: 0,
        pickupOrders: 0,
        deliveryOrders: 0,
        totalDiscounts: 0,
        couponUsage: 0,
        aov: 0
      }
    };
  }

  private async getTodaySaleByHour() {
    const startOfToday = moment().startOf('day').toDate();
    const sales = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startOfToday },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $hour: '$created_at' },
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: `${i.toString().padStart(2, '0')}:00`,
      items: 0,
      tax: 0,
      tips: 0
    }));

    sales.forEach(s => {
      if (hours[s._id]) {
        hours[s._id].items = Number(Number(s.items).toFixed(2));
        hours[s._id].tax = Number(Number(s.tax).toFixed(2));
        hours[s._id].tips = Number(Number(s.tips).toFixed(2));
      }
    });

    return hours;
  }

  private async getWeekdaySaleBreakdown() {
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();
    const sales = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startOfWeek, $lte: endOfWeek },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $isoDayOfWeek: '$created_at' }, // 1=Mon ... 7=Sun
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays.map((name, idx) => {
      const dayData = sales.find((s) => s._id === idx + 1);
      const items = dayData ? Number(Number(dayData.items).toFixed(2)) : 0;
      const tax = dayData ? Number(Number(dayData.tax).toFixed(2)) : 0;
      const tips = dayData ? Number(Number(dayData.tips).toFixed(2)) : 0;
      return {
        label: name,
        items,
        tax,
        tips,
        total: Number((items + tax + tips).toFixed(2)),
      };
    });
  }

  private async getMonthlySaleBreakdownForYear(year: number) {
    const startOfYear = moment().year(year).startOf('year').toDate();
    const endOfYear = moment().year(year).endOf('year').toDate();
    const sales = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startOfYear, $lte: endOfYear },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $month: '$created_at' },
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((name, index) => {
      const monthData = sales.find((s) => s._id === index + 1);
      const items = monthData ? Number(Number(monthData.items).toFixed(2)) : 0;
      const tax = monthData ? Number(Number(monthData.tax).toFixed(2)) : 0;
      const tips = monthData ? Number(Number(monthData.tips).toFixed(2)) : 0;
      return {
        label: name,
        tooltipLabel: `${name} ${year}`,
        items,
        tax,
        tips,
        total: Number((items + tax + tips).toFixed(2)),
      };
    });
  }

  private async getYearlySaleBreakdownByYear(yearsRange?: number) {
    const currentYear = moment().year();
    const startBoundary = yearsRange && yearsRange > 0
      ? moment().subtract(yearsRange - 1, 'years').startOf('year').toDate()
      : undefined;
    const endBoundary = yearsRange && yearsRange > 0
      ? moment().endOf('year').toDate()
      : undefined;

    const sales = await OrderModel.aggregate([
      {
        $addFields: {
          analytics_created_at: { $ifNull: ['$created_at', '$createdAt'] },
        },
      },
      {
        $match: {
          status: 'completed',
          analytics_created_at: {
            $ne: null,
            ...(startBoundary ? { $gte: startBoundary } : {}),
            ...(endBoundary ? { $lte: endBoundary } : {}),
          },
        },
      },
      {
        $group: {
          _id: { $year: '$analytics_created_at' },
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const saleByYear = new Map<number, { items: number; tax: number; tips: number }>();
    sales.forEach((yearData) => {
      saleByYear.set(yearData._id, {
        items: Number(Number(yearData.items).toFixed(2)),
        tax: Number(Number(yearData.tax).toFixed(2)),
        tips: Number(Number(yearData.tips).toFixed(2)),
      });
    });

    let startYear = currentYear;
    let endYear = currentYear;

    if (yearsRange && yearsRange > 0) {
      startYear = currentYear - (yearsRange - 1);
      endYear = currentYear;
    } else if (sales.length) {
      startYear = Math.min(...sales.map((s) => s._id));
      endYear = Math.max(...sales.map((s) => s._id));
    }

    const buckets = [];
    for (let year = startYear; year <= endYear; year += 1) {
      const yearData = saleByYear.get(year);
      const items = yearData?.items ?? 0;
      const tax = yearData?.tax ?? 0;
      const tips = yearData?.tips ?? 0;
      buckets.push({
        label: String(year),
        items,
        tax,
        tips,
        total: Number((items + tax + tips).toFixed(2)),
      });
    }

    return buckets;
  }

  private async getSaleBreakdownByRange(startDate: Date, unit: 'day' | 'month', endDate?: Date) {
    const matchQuery: any = {
      created_at: { $gte: startDate },
      status: 'completed'
    };
    if (endDate) {
      matchQuery.created_at.$lte = endDate;
    }

    const sales = await OrderModel.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: unit === 'day' ? "%Y-%m-%d" : "%Y-%m", 
              date: "$created_at" 
            }
          },
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (unit === 'day') {
      const days = [];
      const endMom = endDate ? moment(endDate) : moment();
      const numDays = endMom.diff(moment(startDate), 'days') + 1;
      for (let i = 0; i < numDays; i++) {
        const dateStr = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
        const dayData = sales.find(s => s._id === dateStr);
        days.push({
          label: moment(dateStr).format('MMM DD'),
          items: dayData ? Number(Number(dayData.items).toFixed(2)) : 0,
          tax: dayData ? Number(Number(dayData.tax).toFixed(2)) : 0,
          tips: dayData ? Number(Number(dayData.tips).toFixed(2)) : 0
        });
      }
      return days;
    }

    return sales.map(s => ({
      label: s._id,
      items: Number(Number(s.items).toFixed(2)),
      tax: Number(Number(s.tax).toFixed(2)),
      tips: Number(Number(s.tips).toFixed(2))
    }));
  }

  private async getYearlySaleBreakdown() {
    const startOfYear = moment().startOf('year').toDate();
    const sales = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startOfYear },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $month: '$created_at' },
          items: { $sum: '$money.subtotal' },
          tax: { $sum: '$money.tax_total' },
          tips: { $sum: '$money.tips' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((name, index) => {
      const monthData = sales.find(s => s._id === index + 1);
      return {
        label: name,
        items: monthData ? Number(Number(monthData.items).toFixed(2)) : 0,
        tax: monthData ? Number(Number(monthData.tax).toFixed(2)) : 0,
        tips: monthData ? Number(Number(monthData.tips).toFixed(2)) : 0,
        total: monthData ? Number((monthData.items + monthData.tax + monthData.tips).toFixed(2)) : 0
      };
    });
  }

  private async getTotalRefunds(): Promise<number> {
    const result = await OrderModel.aggregate([
      { $match: { status: 'refunded' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$money.total_amount' },
        },
      },
    ]);
    return result[0] ? Number(Number(result[0].total).toFixed(2)) : 0;
  }

  private async getActiveCouponDetailsForRange(
    startDate: Date,
    endDate?: Date,
  ): Promise<ActiveCouponDetail[]> {
    const matchQuery: any = {
      created_at: { $gte: startDate },
      status: { $ne: 'canceled' },
      'money.coupon_code': { $nin: [null, ''] },
    };
    if (endDate) {
      matchQuery.created_at.$lte = endDate;
    }

    const couponUsage = await OrderModel.aggregate([
      { $match: matchQuery },
      {
        $project: {
          couponCode: { $trim: { input: { $toUpper: '$money.coupon_code' } } },
          discount: { $ifNull: ['$money.discount', 0] },
          customerId: '$customer_id',
        },
      },
      { $match: { couponCode: { $ne: '' } } },
      {
        $group: {
          _id: '$couponCode',
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: '$discount' },
          uniqueCustomers: { $addToSet: '$customerId' },
        },
      },
      {
        $project: {
          _id: 0,
          code: '$_id',
          usageCount: 1,
          totalDiscount: { $round: ['$totalDiscount', 2] },
          uniqueCustomers: { $size: '$uniqueCustomers' },
        },
      },
      { $match: { usageCount: { $gte: 1 } } },
      { $sort: { usageCount: -1, totalDiscount: -1 } },
    ]);

    if (!couponUsage.length) {
      return [];
    }

    const normalizedCodes = couponUsage.map((item) => item.code);
    const coupons = await CouponModel.aggregate([
      { $match: { is_approve: true } },
      {
        $project: {
          code: 1,
          description: 1,
          type: 1,
          amount: 1,
          active_from: 1,
          expire_at: 1,
          minimum_cart_amount: 1,
          max_conversions: 1,
          is_approve: 1,
          normalizedCode: { $trim: { input: { $toUpper: '$code' } } },
        },
      },
      { $match: { normalizedCode: { $in: normalizedCodes } } },
    ]);

    if (!coupons.length) {
      return [];
    }

    const now = moment();
    const couponsByCode = new Map(
      coupons.map((coupon) => [coupon.normalizedCode, coupon]),
    );

    return couponUsage
      .map((usage) => {
        const coupon = couponsByCode.get(usage.code);
        if (!coupon) {
          return null;
        }

        const startsAt = moment(coupon.active_from).startOf('day');
        const expiresAt = moment(coupon.expire_at).endOf('day');
        if (
          !startsAt.isValid() ||
          !expiresAt.isValid() ||
          !now.isBetween(startsAt, expiresAt, undefined, '[]')
        ) {
          return null;
        }

        return {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          amount: coupon.amount ?? 0,
          activeFrom: coupon.active_from,
          expireAt: coupon.expire_at,
          minimumCartAmount: coupon.minimum_cart_amount ?? 0,
          maxConversions: coupon.max_conversions ?? null,
          isApproved: coupon.is_approve,
          usageCount: usage.usageCount,
          uniqueCustomers: usage.uniqueCustomers,
          totalDiscount: usage.totalDiscount ?? 0,
        } as ActiveCouponDetail;
      })
      .filter((item): item is ActiveCouponDetail => item !== null);
  }
}
