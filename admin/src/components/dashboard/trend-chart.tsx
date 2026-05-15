import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { DashboardAnalyticsData } from '@/data/dashboard';
import { useAnalyticsQuery } from '@/data/dashboard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { DownloadIcon } from '@/components/icons/download-icon';
import { exportToExcel, exportToPDF } from '@/utils/export-data';

const Chart = dynamic(() => import('@/components/ui/chart'), { ssr: false });

interface TrendChartProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES = [
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
  { labelKey: 'text-custom' as const,  day: -1  },
];

export default function TrendChart({ analyticsData }: TrendChartProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<number>(30); // Default to Monthly
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  const { data: customData } = useAnalyticsQuery({
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
    enabled: activeTimeFrame === -1 && !!startDate && !!endDate,
  });

  const history = (() => {
    switch (activeTimeFrame) {
      case 7:   return analyticsData?.salesHistory?.weekly  ?? [];
      case 30:  return analyticsData?.salesHistory?.monthly ?? [];
      case 365: return analyticsData?.salesHistory?.yearly  ?? [];
      case -1:  return customData?.data?.salesHistory?.custom ?? [];
      default:  return analyticsData?.salesHistory?.monthly ?? [];
    }
  })();

  const categories = history.map((h) => h.label);
  
  // Total Sales calculation for trend
  const totalSalesData = history.map((h) => Number(h.items ?? 0) + Number(h.tax ?? 0) + Number(h.tips ?? 0));

  const series = [
    {
      name: t('text-total-sales') || 'Total Sales',
      data: totalSalesData,
    }
  ];

  const handleExportExcel = async () => {
    const data = history.map(h => ({
      date: h.label,
      items: h.items,
      tax: h.tax,
      tips: h.tips,
      total: Number(h.items ?? 0) + Number(h.tax ?? 0) + Number(h.tips ?? 0)
    }));

    await exportToExcel({
      fileName: 'Sales_Trend_Analysis',
      title: 'Sales Trend Analysis',
      columns: [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Items Revenue', key: 'items', width: 20 },
        { header: 'Taxes', key: 'tax', width: 20 },
        { header: 'Tips', key: 'tips', width: 20 },
        { header: 'Total Sales', key: 'total', width: 20 },
      ],
      data,
    });
  };

  const handleExportPDF = () => {
    const data = history.map(h => ({
      date: h.label,
      items: h.items,
      tax: h.tax,
      tips: h.tips,
      total: Number(h.items ?? 0) + Number(h.tax ?? 0) + Number(h.tips ?? 0)
    }));

    exportToPDF({
      fileName: 'Sales_Trend_Analysis',
      title: 'Sales Trend Analysis',
      columns: [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Items Revenue', key: 'items', width: 20 },
        { header: 'Taxes', key: 'tax', width: 20 },
        { header: 'Tips', key: 'tips', width: 20 },
        { header: 'Total Sales', key: 'total', width: 20 },
      ],
      data,
    });
  };

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
      width: 3,
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
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    colors: ['#4f46e5'], // Indigo for trend
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }: {
        series: number[][];
        dataPointIndex: number;
        w: any;
      }) => {
        const seriesNames: string[] = w.globals.seriesNames;
        const colors: string[] = w.globals.colors;
        const label: string = categories[dataPointIndex] ?? '';

        const fmt = (v: number) => `$${v.toFixed(2)}`;

        const deltaTag = (current: number, prev: number | undefined) => {
          if (prev === undefined || dataPointIndex === 0) return '';
          const diff = current - prev;
          const pct = prev !== 0 ? ((diff / prev) * 100).toFixed(1) : null;
          const isUp = diff >= 0;
          const sign = isUp ? '+' : '−';
          const absDiff = Math.abs(diff);
          const color = isUp ? '#10b981' : '#ef4444';
          const arrow = isUp ? '▲' : '▼';
          return `
            <span style="
              display:inline-flex;align-items:center;gap:2px;
              margin-left:6px;padding:1px 6px;border-radius:9999px;
              background:${color}18;color:${color};
              font-size:10px;font-weight:600;white-space:nowrap;
            ">
              ${arrow} ${sign}${fmt(absDiff)}${pct !== null ? ` (${pct}%)` : ''}
            </span>`;
        };

        let rows = '';
        series.forEach((s, i) => {
          const cur = s[dataPointIndex] ?? 0;
          const prev = dataPointIndex > 0 ? s[dataPointIndex - 1] : undefined;
          rows += `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:3px 0;">
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0;"></span>
                <span style="color:#6B7280;font-size:12px;">${seriesNames[i]}</span>
              </div>
              <div style="display:flex;align-items:center;">
                <span style="font-weight:600;font-size:12px;color:#111827;">${fmt(cur)}</span>
                ${deltaTag(cur, prev)}
              </div>
            </div>`;
        });

        return `
          <div style="
            background:#fff;border:1px solid #E5E7EB;border-radius:10px;
            padding:10px 14px;min-width:220px;box-shadow:0 4px 12px rgba(0,0,0,0.08);
            font-family:'Inter',sans-serif;
          ">
            <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px;border-bottom:1px solid #F3F4F6;padding-bottom:6px;">
              ${label}
            </div>
            ${rows}
          </div>`;
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
            {t('text-trend-analysis') || 'Sales Trend Analysis'}
          </h3>
          <p className="mt-1 text-sm text-body">{t('text-trend-analysis-guide') || 'Compare sales trends over time'}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {activeTimeFrame === -1 && (
            <div className="relative z-20">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="w-full sm:w-60 h-10 rounded border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                placeholderText="Select date range"
              />
            </div>
          )}
          
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

          <Menu as="div" className="relative inline-block text-left z-20">
            <Menu.Button className="inline-flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 sm:w-auto h-10 transition-colors">
              <DownloadIcon className="h-4 w-4" />
              {t('text-export') || 'Export'}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleExportExcel}
                        className={cn(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm font-medium rounded-md'
                        )}
                      >
                        Export to Excel
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleExportPDF}
                        className={cn(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm font-medium rounded-md'
                        )}
                      >
                        Export to PDF
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      <div className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          height={400}
          type="area"
        />
      </div>
    </div>
  );
}
