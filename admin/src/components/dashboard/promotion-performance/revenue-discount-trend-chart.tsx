import { useEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RevenueDiscountPoint } from './types';

export default function RevenueDiscountTrendChart({
  data,
  compareEnabled = false,
}: {
  data: RevenueDiscountPoint[];
  compareEnabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width > 0 && height > 0) {
        setChartSize({ width, height });
      } else {
        setChartSize(null);
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Revenue vs Discount Trend</h4>
      <p className="mt-1 text-xs text-gray-500">
        Compare promotion growth against discount cost
        {compareEnabled ? ' (vs previous period)' : ''}
      </p>

      <div ref={containerRef} className="mt-4 h-72 min-h-[18rem] min-w-0">
        {chartSize ? (
          <LineChart width={chartSize.width} height={chartSize.height} data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#dc2626"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="discount"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              name="Discount"
            />
            {compareEnabled ? (
              <>
                <Line
                  type="monotone"
                  dataKey="previousRevenue"
                  stroke="#f87171"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue (Prev)"
                />
                <Line
                  type="monotone"
                  dataKey="previousDiscount"
                  stroke="#fbbf24"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  dot={false}
                  name="Discount (Prev)"
                />
              </>
            ) : null}
          </LineChart>
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        )}
      </div>
    </div>
  );
}
