import { SmartAlert } from './types';

const toneMap: Record<SmartAlert['tone'], string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
};

export default function AlertsPanel({ alerts }: { alerts: SmartAlert[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Smart Alerts</h4>
      <p className="mt-1 text-xs text-gray-500">Promotion opportunities and risks</p>

      <div className="mt-4 space-y-3">
        {alerts.map((alert, idx) => (
          <div key={`${alert.tone}-${idx}`} className={`rounded-xl border p-3 text-sm ${toneMap[alert.tone]}`}>
            {alert.text}
          </div>
        ))}
      </div>
    </div>
  );
}
