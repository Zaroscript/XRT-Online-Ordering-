import { useMemo, useState } from 'react';
import cn from 'classnames';
import { CouponPerformanceRow } from './types';

type SortKey = keyof CouponPerformanceRow;

const columns: Array<{ key: SortKey; label: string; isNumeric?: boolean }> = [
  { key: 'couponName', label: 'Coupon Name' },
  { key: 'type', label: 'Type' },
  { key: 'uses', label: 'Uses', isNumeric: true },
  { key: 'revenue', label: 'Revenue', isNumeric: true },
  { key: 'discountCost', label: 'Discount Cost', isNumeric: true },
  { key: 'netProfit', label: 'Net Profit', isNumeric: true },
  { key: 'newCustomers', label: 'New Customers', isNumeric: true },
  { key: 'roi', label: 'ROI %', isNumeric: true },
  { key: 'status', label: 'Status' },
];

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function statusClass(status: CouponPerformanceRow['status']) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-600';
  if (status === 'expiring') return 'bg-amber-50 text-amber-600';
  return 'bg-gray-100 text-gray-600';
}

export default function PerformanceTable({ rows }: { rows: CouponPerformanceRow[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('uses');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? rows.filter(
          (row) =>
            row.couponName.toLowerCase().includes(query) ||
            row.type.toLowerCase().includes(query) ||
            row.status.toLowerCase().includes(query),
        )
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [rows, search, sortBy, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('desc');
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Coupon Performance</h4>
          <p className="mt-1 text-xs text-gray-500">Sortable promotion profitability view</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupon..."
          className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-red-300 sm:w-64"
        />
      </div>

      {filteredRows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'cursor-pointer px-3 py-3 font-semibold transition-colors hover:text-red-600',
                      col.isNumeric ? 'text-right' : 'text-left',
                    )}
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.couponName} className="border-b border-gray-50 transition-colors hover:bg-gray-50/70">
                  <td className="px-3 py-3 font-semibold text-gray-900">{row.couponName}</td>
                  <td className="px-3 py-3 text-gray-700">{row.type}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{row.uses}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{formatMoney(row.revenue)}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{formatMoney(row.discountCost)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-900">{formatMoney(row.netProfit)}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{row.newCustomers}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{row.roi.toFixed(1)}%</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          No coupon performance records found for this filter.
        </div>
      )}
    </div>
  );
}
