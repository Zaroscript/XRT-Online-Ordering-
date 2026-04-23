import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { DashboardAnalyticsData } from '@/data/dashboard';
import { getDashboardSummaryStats } from '@/data/dashboard';
import usePrice from '@/utils/use-price';
import { CouponIcon } from '@/components/icons/coupon-icon';

const Chart = dynamic(() => import('@/components/ui/chart'), { ssr: false });

interface CouponAnalysisProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES = [
  { labelKey: 'text-today' as const,   day: 1   },
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
];

export default function CouponAnalysis({ analyticsData }: CouponAnalysisProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<number>(1);

  const stats = getDashboardSummaryStats(analyticsData, activeTimeFrame);

  const { price: formattedTotalDiscounts } = usePrice({
    amount: stats.totalDiscounts ?? 0,
  });

  const usageRate = stats.completedOrders > 0
    ? Math.round((stats.couponUsage / stats.completedOrders) * 100)
    : 0;

  const chartOptions = {
    chart: {
      type: 'radialBar' as const,
      fontFamily: "'Inter', sans-serif",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        dataLabels: {
          name: {
            show: true,
            color: '#6B7280',
            fontSize: '13px',
          },
          value: {
            show: true,
            color: '#1F2937',
            fontSize: '30px',
            fontWeight: 600,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    colors: ['#00E396'],
    labels: [t('text-usage-rate') || 'Usage Rate'],
    stroke: { lineCap: 'round' as const },
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-light p-6 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="before:content-[''] relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {t('text-coupon-analysis') || 'Active Coupons Analysis'}
          </h3>
          <p className="mt-1 text-sm text-body">
            {t('text-coupon-analysis-guide') || 'Coupon usage and total customer discounts'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-full bg-gray-100/80 p-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {TIME_FRAMES.map((tf) => (
              <div key={tf.day} className="relative">
                <Button
                  className={cn(
                    '!focus:ring-0 relative z-10 !h-7 rounded-full !px-2.5 text-sm font-medium text-gray-500',
                    tf.day === activeTimeFrame ? 'text-accent' : '',
                  )}
                  type="button"
                  onClick={() => setActiveTimeFrame(tf.day)}
                  variant="custom"
                >
                  {t(tf.labelKey) || tf.labelKey.replace('text-', '')}
                </Button>
                {tf.day === activeTimeFrame && (
                  <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        
        {/* Data Part */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div className="flex items-center gap-5 rounded border border-border-200 bg-gray-50/50 p-6 h-full">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-teal-100/80 text-teal-600">
              <CouponIcon className="h-8 w-8" />
            </div>
            <div className="flex w-full flex-col">
              <span className="mb-1 text-sm font-medium text-body">
                {t('text-active-coupons-usage') || 'Active Coupons Usage'}
              </span>
              <span className="text-3xl font-bold text-heading">
                {stats.couponUsage ?? 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded border border-border-200 bg-gray-50/50 p-6 h-full">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-pink-100/80 text-pink-600">
              <span className="text-3xl font-black">%</span>
            </div>
            <div className="flex w-full flex-col">
              <span className="mb-1 text-sm font-medium text-body">
                {t('text-total-discounts') || 'Total Discounts Given'}
              </span>
              <span className="text-3xl font-bold text-heading">
                {formattedTotalDiscounts}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Part */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center rounded border border-border-200 bg-gray-50/50 p-6 min-h-[250px] h-full">
          <span className="text-sm font-medium text-body mb-2 block w-full text-center">
            {t('text-coupon-penetration') || 'Coupon Penetration Rate'}
          </span>
          <Chart
            options={chartOptions}
            series={[usageRate]}
            height={220}
            type="radialBar"
          />
        </div>

      </div>
    </div>
  );
}
