import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { BusinessModel } from '../../infrastructure/database/models/BusinessModel';
import { ItemModel } from '../../infrastructure/database/models/ItemModel';
import moment from 'moment';

export class AnalyticsController {
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
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
}
