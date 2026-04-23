import Chart from '@/components/ui/chart';
import cn from 'classnames';
import { ArrowUp } from '@/components/icons/arrow-up';
import { ArrowDown } from '@/components/icons/arrow-down';
import { useTranslation } from 'next-i18next';

const BarChart = ({
  widgetTitle,
  series,
  colors,
  prefix,
  totalValue,
  text,
  position,
  percentage,
  categories,
}: any) => {
  const { t } = useTranslation();

  // Robust normalization for multi-series and single-series data
  let finalSeries = [];
  if (Array.isArray(series)) {
    if (series.length > 0 && typeof series[0] === 'object' && series[0] !== null && 'data' in series[0]) {
      // Already in [{name, data}] format
      finalSeries = series.map(s => ({
        name: s.name,
        data: Array.isArray(s.data) ? s.data.map((v: any) => isNaN(Number(v)) ? 0 : Number(v)) : []
      }));
    } else {
      // Simple array format [1,2,3]
      finalSeries = [{
        name: widgetTitle || t('common:sale-history'),
        data: series.map((v: any) => isNaN(Number(v)) ? 0 : Number(v))
      }];
    }
  }

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      stacked: false, // Ensure side-by-side grouped bars
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 2,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories || [],
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
        formatter: (val: number) => `${prefix || '$'}${Number(val).toFixed(2)}`
      }
    },
    fill: { opacity: 1 },
    colors: colors || ['#009f7f', '#ef4444', '#3b82f6'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${prefix || '$'}${Number(val).toFixed(2)}`
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      offsetY: 0,
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
      padding: { left: 10, right: 10 }
    },
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-7">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="before:content-'' relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {widgetTitle}
          </h3>
          <p className="mt-2 text-sm text-body">{t('common:text-sales-breakdown-guide')}</p>
        </div>

        {totalValue && (
          <div className="flex flex-col text-end">
            <span className="text-lg font-semibold text-heading">
              {prefix}{totalValue}
            </span>
            {percentage && (
              <div className="flex items-center justify-end">
                {position === 'up' ? (
                  <span className="text-green-500"><ArrowUp /></span>
                ) : (
                  <span className="text-red-400"><ArrowDown /></span>
                )}
                <span className={cn("text-sm ms-1", position === 'down' ? 'text-red-400' : 'text-green-500')}>
                  {percentage}
                </span>
                <span className="text-xs text-body ms-1">{text}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full">
        <Chart
          options={options}
          series={finalSeries}
          height={400}
          type="bar"
        />
      </div>

      {finalSeries.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors?.[0] || '#009f7f' }}></div>
            <span className="text-xs font-medium text-body">{t('common:text-items-revenue')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors?.[1] || '#ef4444' }}></div>
            <span className="text-xs font-medium text-body">{t('common:text-taxes')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors?.[2] || '#3b82f6' }}></div>
            <span className="text-xs font-medium text-body">{t('common:text-tips')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChart;
