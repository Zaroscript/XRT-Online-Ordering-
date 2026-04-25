import { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  useCouponPerformanceAnalyticsQuery,
  type DashboardAnalyticsData,
} from '@/data/dashboard';
import KpiCard from '@/components/dashboard/promotion-performance/kpi-card';
import ConversionFunnelCard from '@/components/dashboard/promotion-performance/conversion-funnel-card';
import RevenueDiscountTrendChart from '@/components/dashboard/promotion-performance/revenue-discount-trend-chart';
import TopPerformingCouponsChart from '@/components/dashboard/promotion-performance/top-performing-coupons-chart';
import AlertsPanel from '@/components/dashboard/promotion-performance/alerts-panel';
import PerformanceTable from '@/components/dashboard/promotion-performance/performance-table';
import TimeRangeFilter, {
  TimeRangeOption,
  TimeRangeValue,
} from '@/components/dashboard/promotion-performance/time-range-filter';
import type {
  CouponPerformanceRow,
  PromotionFunnelData,
  PromotionKpi,
  RevenueDiscountPoint,
  SmartAlert,
} from '@/components/dashboard/promotion-performance/types';

interface CouponAnalysisProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES: Array<{ labelKey: 'text-today' | 'text-weekly' | 'text-monthly' | 'text-yearly'; day: TimeRangeValue }> = [
  { labelKey: 'text-today', day: 1 },
  { labelKey: 'text-weekly', day: 7 },
  { labelKey: 'text-monthly', day: 30 },
  { labelKey: 'text-yearly', day: 365 },
];

function formatMoney(amount: number) {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function CouponAnalysis(_: CouponAnalysisProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<TimeRangeValue>(1);
  const [comparePreviousPeriod, setComparePreviousPeriod] = useState(false);
  const {
    data: couponAnalyticsResponse,
    isPending,
    isFetching,
    isError,
    error,
  } = useCouponPerformanceAnalyticsQuery({ rangeDays: activeTimeFrame });
  const couponAnalytics = couponAnalyticsResponse?.data;
  const tt = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const showSkeleton = isPending || (!couponAnalytics && isFetching);
  const timeRangeOptions: TimeRangeOption[] = TIME_FRAMES.map((item) => ({
    value: item.day,
    label: tt(item.labelKey, item.labelKey.replace('text-', '')),
  }));

  const performanceRows = useMemo<CouponPerformanceRow[]>(
    () => couponAnalytics?.table ?? [],
    [couponAnalytics?.table],
  );

  const kpiData = useMemo<PromotionKpi[]>(() => {
    const summary = couponAnalytics?.summary;
    if (!summary) return [];
    const aovLift = getDeltaPercent(summary.aovWithCoupon, summary.aovWithoutCoupon);

    return [
      {
        title: 'Coupon Revenue Generated',
        value: formatMoney(summary.couponRevenueGenerated),
        trendLabel: 'Completed orders with coupon',
        trendValue: getDeltaPercent(
          summary.couponRevenueGenerated,
          summary.previous.couponRevenueGenerated,
        ),
        icon: 'revenue',
      },
      {
        title: 'Net Revenue After Discounts',
        value: formatMoney(summary.netRevenueAfterDiscounts),
        trendLabel: 'Revenue - discount cost',
        trendValue: getDeltaPercent(
          summary.netRevenueAfterDiscounts,
          summary.previous.netRevenueAfterDiscounts,
        ),
        icon: 'net',
      },
      {
        title: 'New Customers via Coupons',
        value: summary.newCustomersViaCoupons.toLocaleString(),
        trendLabel: 'First paid order used coupon',
        trendValue: getDeltaPercent(
          summary.newCustomersViaCoupons,
          summary.previous.newCustomersViaCoupons,
        ),
        icon: 'customers',
      },
      {
        title: 'Avg Order Value',
        trendLabel: 'Coupon orders vs regular orders',
        trendValue: getDeltaPercent(summary.aovWithCoupon, summary.previous.aovWithCoupon),
        icon: 'aov',
        badgeLabel: `${aovLift >= 0 ? '+' : ''}${aovLift.toFixed(1)}% ${
          aovLift >= 0 ? 'Higher' : 'Lower'
        }`,
        valueComparison: {
          leftLabel: 'Coupon Orders',
          leftValue: formatMoney(summary.aovWithCoupon),
          leftMeta: `${summary.couponOrdersCompleted} ${
            summary.couponOrdersCompleted === 1 ? 'order' : 'orders'
          }`,
          rightLabel: 'Regular Orders',
          rightValue: formatMoney(summary.aovWithoutCoupon),
          rightMeta: `${summary.withoutCouponOrdersCompleted} ${
            summary.withoutCouponOrdersCompleted === 1 ? 'order' : 'orders'
          }`,
        },
      },
    ];
  }, [couponAnalytics?.summary]);

  const funnelData = useMemo<PromotionFunnelData>(
    () => couponAnalytics?.funnel ?? { viewed: 0, applied: 0, completed: 0 },
    [couponAnalytics?.funnel],
  );

  const trendData = useMemo<RevenueDiscountPoint[]>(
    () =>
      (couponAnalytics?.trend ?? []).map((point) => ({
        label: point.label,
        revenue: point.revenue,
        discount: point.discount,
        previousRevenue: point.previousRevenue,
        previousDiscount: point.previousDiscount,
      })),
    [couponAnalytics?.trend],
  );

  const alerts = useMemo<SmartAlert[]>(() => couponAnalytics?.alerts ?? [], [couponAnalytics?.alerts]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Promotion Performance Dashboard
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Revenue, conversion, and profitability insights for smarter promotion decisions.
          </p>
        </div>

        <TimeRangeFilter
          value={activeTimeFrame}
          onChange={setActiveTimeFrame}
          options={timeRangeOptions}
          compareEnabled={comparePreviousPeriod}
          onCompareChange={setComparePreviousPeriod}
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error?.message || 'Failed to load coupon performance analytics.'}
        </div>
      ) : showSkeleton ? (
        <div className="space-y-5 animate-pulse">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-28 rounded-2xl bg-gray-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="h-80 rounded-2xl bg-gray-100" />
            <div className="h-80 rounded-2xl bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="h-56 rounded-2xl bg-gray-100" />
            <div className="h-56 rounded-2xl bg-gray-100" />
          </div>
          <div className="h-80 rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiData.map((item) => (
              <KpiCard key={item.title} item={item} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RevenueDiscountTrendChart
              data={trendData}
              compareEnabled={comparePreviousPeriod}
            />
            <TopPerformingCouponsChart rows={performanceRows} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ConversionFunnelCard data={funnelData} />
            <AlertsPanel alerts={alerts} />
          </div>

          <PerformanceTable rows={performanceRows} />

          {!performanceRows.length && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No coupon activity for selected period.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
