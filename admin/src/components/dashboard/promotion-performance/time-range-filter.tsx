import cn from 'classnames';

export type TimeRangeValue = 1 | 7 | 30 | 365;

export interface TimeRangeOption {
  label: string;
  value: TimeRangeValue;
}

interface TimeRangeFilterProps {
  value: TimeRangeValue;
  onChange: (value: TimeRangeValue) => void;
  options: TimeRangeOption[];
  compareEnabled?: boolean;
  onCompareChange?: (enabled: boolean) => void;
}

export default function TimeRangeFilter({
  value,
  onChange,
  options,
  compareEnabled = false,
  onCompareChange,
}: TimeRangeFilterProps) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="sm:hidden w-full">
          <select
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            value={value}
            onChange={(event) => onChange(Number(event.target.value) as TimeRangeValue)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden items-center rounded-full bg-gray-100 p-1 sm:inline-flex">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  'h-8 rounded-full px-3 text-xs font-semibold transition-all duration-200',
                  active
                    ? 'bg-red-100 text-red-600 shadow-sm'
                    : 'text-gray-500 hover:bg-white hover:text-gray-700',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Open date picker"
          className="hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-200 hover:bg-gray-200 hover:text-gray-700 sm:inline-flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M5 6h14a1 1 0 011 1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z" />
          </svg>
        </button>
      </div>

      {onCompareChange ? (
        <button
          type="button"
          onClick={() => onCompareChange(!compareEnabled)}
          className={cn(
            'inline-flex h-8 items-center gap-2 self-start rounded-full px-3 text-xs font-semibold transition-all duration-200 sm:self-end',
            compareEnabled
              ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          )}
        >
          <span
            className={cn(
              'relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200',
              compareEnabled ? 'bg-red-500' : 'bg-gray-300',
            )}
          >
            <span
              className={cn(
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200',
                compareEnabled ? 'translate-x-3.5' : 'translate-x-0.5',
              )}
            />
          </span>
          Compare Previous Period
        </button>
      ) : null}
    </div>
  );
}
