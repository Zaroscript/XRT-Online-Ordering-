import { useMemo, useState } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesChartProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Green = Items Revenue, Red = Taxes, Blue = Tips */
const CHART_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

const TIME_FRAMES = [
  { labelKey: 'text-today' as const,   day: 1   },
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
  { labelKey: 'text-custom' as const,  day: -1  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesChart({ analyticsData }: SalesChartProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearlyRange, setYearlyRange] = useState<number | 'all'>(5);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - index);
  }, []);

  const { data: customData } = useAnalyticsQuery({
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
    enabled: activeTimeFrame === -1 && !!startDate && !!endDate,
  });

  const { data: monthlyBucketData } = useAnalyticsQuery({
    granularity: 'month',
    year: selectedYear,
    enabled: activeTimeFrame === 30,
  });

  const { data: weeklyBucketData } = useAnalyticsQuery({
    granularity: 'weekday',
    enabled: activeTimeFrame === 7,
  });

  const { data: yearlyBucketData } = useAnalyticsQuery({
    granularity: 'year',
    years_range: yearlyRange,
    enabled: activeTimeFrame === 365,
  });

  // Derive the correct time-bucket from analyticsData
  const history = (() => {
    switch (activeTimeFrame) {
      case 1:   return analyticsData?.salesHistory?.today   ?? [];
      case 7:   return weeklyBucketData?.data?.salesHistory?.custom  ?? [];
      case 30:  return monthlyBucketData?.data?.salesHistory?.custom ?? [];
      case 365: return yearlyBucketData?.data?.salesHistory?.custom  ?? [];
      case -1:  return customData?.data?.salesHistory?.custom ?? [];
      default:  return analyticsData?.salesHistory?.today   ?? [];
    }
  })();

  const categories = history.map((h) => h.label);
  const tooltipLabels = history.map((h) => h.tooltipLabel ?? h.label);

  const series = [
    {
      name: t('text-items-revenue'),
      data: history.map((h) => Number(h.items ?? 0)),
    },
    {
      name: t('text-taxes'),
      data: history.map((h) => Number(h.tax ?? 0)),
    },
    {
      name: t('text-tips'),
      data: history.map((h) => Number(h.tips ?? 0)),
    },
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
      fileName: 'Sales_History_Export',
      title: 'Sales History',
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
      fileName: 'Sales_History_Export',
      title: 'Sales History',
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
      type: 'bar' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      stacked: false,
      fontFamily: "'Inter', sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '65%',
        borderRadius: 3,
        dataLabels: { position: 'top' as const },
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
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
    fill: { opacity: 1 },
    colors: CHART_COLORS,
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
        const label: string = tooltipLabels[dataPointIndex] ?? categories[dataPointIndex] ?? '';

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

        let currentTotal = 0;
        let prevTotal = 0;
        let rows = '';

        series.forEach((s, i) => {
          const cur = s[dataPointIndex] ?? 0;
          const prev = dataPointIndex > 0 ? s[dataPointIndex - 1] : undefined;
          currentTotal += cur;
          if (prev !== undefined) prevTotal += prev;

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

        const totalDelta = deltaTag(currentTotal, dataPointIndex > 0 ? prevTotal : undefined);

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
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;padding-top:6px;border-top:1px solid #F3F4F6;">
              <span style="font-size:12px;font-weight:700;color:#111827;">Total</span>
              <div style="display:flex;align-items:center;">
                <span style="font-weight:700;font-size:13px;color:#111827;">${fmt(currentTotal)}</span>
                ${totalDelta}
              </div>
            </div>
          </div>`;
      },
    },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      offsetY: 0,
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-7">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="before:content-[''] relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {t('sale-history')}
          </h3>
          <p className="mt-1 text-sm text-body">{t('text-sales-breakdown-guide')}</p>
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
          {activeTimeFrame === 30 && (
            <Menu as="div" className="relative z-20 inline-block text-left">
              <Menu.Button className="inline-flex h-10 min-w-[148px] items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-accent/50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent/30">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M6 2a1 1 0 10-2 0v1H3a2 2 0 00-2 2v2h18V5a2 2 0 00-2-2h-1V2a1 1 0 10-2 0v1H6V2zM19 9H1v8a2 2 0 002 2h14a2 2 0 002-2V9z" clipRule="evenodd" />
                  </svg>
                  <span>Year: {selectedYear}</span>
                </span>
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
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
                <Menu.Items className="absolute right-0 mt-2 max-h-64 w-44 origin-top-right overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none">
                  {yearOptions.map((year) => (
                    <Menu.Item key={year}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={cn(
                            'w-full rounded-lg px-3 py-2 text-left text-sm',
                            selectedYear === year ? 'bg-accent/10 text-accent font-semibold' : 'text-gray-700',
                            active ? 'bg-gray-100' : '',
                          )}
                        >
                          {year}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          )}
          {activeTimeFrame === 365 && (
            <div className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setYearlyRange(5)}
                className={cn(
                  'h-8 rounded-lg px-3 text-sm font-medium transition-colors focus:outline-none',
                  yearlyRange === 5
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                Last 5 Years
              </button>
              <button
                type="button"
                onClick={() => setYearlyRange('all')}
                className={cn(
                  'h-8 rounded-lg px-3 text-sm font-medium transition-colors focus:outline-none',
                  yearlyRange === 'all'
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                All Time
              </button>
            </div>
          )}
          {/* Timeframe filter — independent from the Summary section filter */}
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

      {/* Chart */}
      <div className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          height={400}
          type="bar"
        />
      </div>

    </div>
  );
}
