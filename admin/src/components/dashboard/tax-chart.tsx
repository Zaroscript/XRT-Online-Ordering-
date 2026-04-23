import { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { DashboardAnalyticsData } from '@/data/dashboard';

const Chart = dynamic(() => import('@/components/ui/chart'), { ssr: false });

interface TaxChartProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES = [
  { labelKey: 'text-today' as const,   day: 1   },
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
];

export default function TaxChart({ analyticsData }: TaxChartProps) {
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
      name: t('text-taxes-collected') || 'Taxes Collected',
      data: history.map((h) => Number(h.tax ?? 0)),
    },
  ];

  const chartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "'Inter', sans-serif",
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
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
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    colors: ['#ef4444'], // Red color for taxes
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
      padding: { left: 10, right: 10 },
    },
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="before:content-[''] relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {t('text-taxes-collected') || 'Taxes Collected'}
          </h3>
          <p className="mt-1 text-sm text-body">{t('text-taxes-breakdown-guide') || 'Tax collected over time'}</p>
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

      <div className="w-full">
        <Chart
          options={chartOptions as any}
          series={series}
          height={300}
          type="area"
        />
      </div>
    </div>
  );
}
