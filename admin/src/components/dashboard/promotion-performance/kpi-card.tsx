import cn from 'classnames';
import { PromotionKpi } from './types';

function KpiIcon({ icon }: { icon: PromotionKpi['icon'] }) {
  const common = 'h-5 w-5';
  if (icon === 'revenue') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 18V6" />
        <path d="M10 18V10" />
        <path d="M16 18V4" />
        <path d="M22 18v-8" />
      </svg>
    );
  }
  if (icon === 'net') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 6-6" />
      </svg>
    );
  }
  if (icon === 'customers') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
        <path d="M18 11a3 3 0 1 0 0-6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h16" />
      <path d="M12 4v16" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default function KpiCard({ item }: { item: PromotionKpi }) {
  const positive = item.trendValue >= 0;
  const hasComparison = Boolean(item.valueComparison);
  const badgeText =
    item.badgeLabel ||
    `${positive ? '+' : ''}${item.trendValue.toFixed(1)}%`;

  return (
    <div className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-red-50 p-2 text-red-600">
            <KpiIcon icon={item.icon} />
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
            )}
          >
            {badgeText}
          </span>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.title}</p>

        {hasComparison ? (
          <div className="grid grid-cols-2 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/40">
            <div className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {item.valueComparison!.leftLabel}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.valueComparison!.leftValue}</p>
              <p className="mt-1 text-xs text-gray-500">{item.valueComparison!.leftMeta}</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {item.valueComparison!.rightLabel}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.valueComparison!.rightValue}</p>
              <p className="mt-1 text-xs text-gray-500">{item.valueComparison!.rightMeta}</p>
            </div>
          </div>
        ) : (
          <p className="text-3xl font-bold leading-tight text-gray-900">{item.value}</p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">{item.trendLabel}</p>
    </div>
  );
}
