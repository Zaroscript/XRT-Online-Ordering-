import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { CouponPerformanceRow } from './types';

export default function TopPerformingCouponsChart({
  rows,
}: {
  rows: CouponPerformanceRow[];
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

  const data = rows.slice(0, 6).map((row) => ({
    name: row.couponName,
    uses: row.uses,
  }));

  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Top Performing Coupons</h4>
      <p className="mt-1 text-xs text-gray-500">Ranked by usage count</p>

      <div ref={containerRef} className="mt-4 h-72 min-h-[18rem] min-w-0">
        {chartSize ? (
          <BarChart
            width={chartSize.width}
            height={chartSize.height}
            data={data}
            layout="vertical"
            margin={{ left: 12, right: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 12 }} width={90} />
            <Tooltip />
            <Bar dataKey="uses" fill="#dc2626" radius={[0, 8, 8, 0]} />
          </BarChart>
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        )}
      </div>
    </div>
  );
}
