import { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { DashboardAnalyticsData } from '@/data/dashboard';

const Chart = dynamic(() => import('@/components/ui/chart'), { ssr: false });

interface TipsChartProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES = [
  { labelKey: 'text-today' as const,   day: 1   },
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
];

export default function TipsChart({ analyticsData }: TipsChartProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<number>(1);

  const history = useMemo(() => {
    switch (activeTimeFrame) {
      case 1:   return analyticsData?.salesHistory?.today   ?? [];
      case 7:   return analyticsData?.salesHistory?.weekly  ?? [];
      case 30:  return analyticsData?.salesHistory?.monthly ?? [];
      case 365: return analyticsData?.salesHistory?.yearly  ?? [];
      default:  return analyticsData?.salesHistory?.today   ?? [];
    }
  }, [activeTimeFrame, analyticsData]);

  const categories = history.map((h) => h.label);

  const series = [
    {
      name: t('text-tips-collected') || 'Tips Collected',
      data: history.map((h) => Number(h.tips ?? 0)),
    },
  ];

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "'Inter', sans-serif",
      borderRadius: 4,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `$${Number(val).toFixed(2)}`,
      offsetY: -20,
      style: {
        fontSize: '10px',
        colors: ['#304758']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          colors: '#6B7280',
          fontSize: '11px',
          fontFamily: "'Inter', sans-serif",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: "'Inter', sans-serif",
        },
        formatter: (val: number) => `$${Number(val).toFixed(2)}`,
      },
    },
    fill: {
      opacity: 1,
      colors: ['#10B981'], // Emerald color for tips
    },
    colors: ['#10B981'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `$${Number(val).toFixed(2)}`,
      },
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
      padding: { left: 10, right: 10, top: 20 },
    },
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-7 border border-gray-100">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-heading">
              {t('text-daily-tips') || 'Daily Tips'}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-gray-500">{t('text-tips-breakdown-guide') || 'Tips collected from orders'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-xl bg-gray-50 p-1 border border-gray-100">
            {TIME_FRAMES.map((tf) => (
              <div key={tf.day} className="relative">
                <Button
                  className={cn(
                    '!focus:ring-0 relative z-10 !h-8 rounded-lg !px-4 text-sm font-semibold transition-colors duration-200',
                    tf.day === activeTimeFrame ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700',
                  )}
                  type="button"
                  onClick={() => setActiveTimeFrame(tf.day)}
                  variant="custom"
                >
                  {t(tf.labelKey) || tf.labelKey.replace('text-', '')}
                </Button>
                {tf.day === activeTimeFrame && (
                  <motion.div 
                    layoutId="tipsTimeframeTab"
                    className="absolute bottom-0 left-0 right-0 top-0 z-0 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <Chart
          options={chartOptions as any}
          series={series}
          height={300}
          type="bar"
        />
      </div>
    </div>
  );
}
