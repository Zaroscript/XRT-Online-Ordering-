import { PromotionFunnelData } from './types';

function FunnelBar({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const percent = max > 0 ? Math.max(8, (value / max) * 100) : 8;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value.toLocaleString()}</span>
      </div>
      <div className="h-3 rounded-full bg-gray-100">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ConversionFunnelCard({
  data,
}: {
  data: PromotionFunnelData;
}) {
  const max = Math.max(data.viewed, data.applied, data.completed, 1);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Coupon Conversion Funnel</h4>
      <p className="mt-1 text-xs text-gray-500">Viewed {'>'} Applied {'>'} Completed</p>

      <div className="mt-5 space-y-4">
        <FunnelBar label="Coupons Viewed" value={data.viewed} max={max} colorClass="bg-red-400" />
        <FunnelBar label="Coupons Applied" value={data.applied} max={max} colorClass="bg-red-500" />
        <FunnelBar label="Orders Completed" value={data.completed} max={max} colorClass="bg-red-600" />
      </div>
    </div>
  );
}
