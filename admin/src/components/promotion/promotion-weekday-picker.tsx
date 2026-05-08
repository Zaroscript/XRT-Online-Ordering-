'use client';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import cn from 'classnames';

/** JavaScript weekday: 0 = Sunday … 6 = Saturday (matches API / business timezone logic). */
export const PROMOTION_JS_WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Form value: [] means “active every day”.
 * Non-empty array = restricted to those weekdays only.
 */
export function togglePromotionWeekday(current: number[], day: number): number[] | null {
  const all = [...PROMOTION_JS_WEEKDAY_ORDER];
  const set = new Set(current.length === 0 ? all : current);
  if (set.has(day)) set.delete(day);
  else set.add(day);
  if (set.size === 0) return null;
  if (set.size === all.length) return [];
  return Array.from(set).sort((a, b) => a - b);
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export default function PromotionWeekdayPicker<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  const { t } = useTranslation('form');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => {
        const restricted = (Array.isArray(value) ? value : []) as number[];
        const isDayOn = (d: number) =>
          restricted.length === 0 || restricted.includes(d);

        return (
          <div className="rounded-xl border border-border-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-heading">
                  {t(
                    'promotion-weekdays-title',
                    'Visible days on the storefront',
                  )}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-body">
                  {t(
                    'promotion-weekdays-helper',
                    'Customers only see this promotion on the days you select. Matches your business timezone.',
                  )}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10"
                onClick={() => onChange([])}
              >
                {t('promotion-weekdays-all-days', 'Every day')}
              </button>
            </div>

            <div
              className="mt-4 flex flex-wrap gap-2"
              role="group"
              aria-label={t(
                'promotion-weekdays-aria',
                'Days when promotion is visible',
              )}
            >
              {PROMOTION_JS_WEEKDAY_ORDER.map((d) => {
                const on = isDayOn(d);
                const fallbacks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const label = t(`promotion-weekday-short-${d}`, fallbacks[d]);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const next = togglePromotionWeekday(restricted, d);
                      if (next === null) {
                        toast.error(
                          t(
                            'promotion-weekdays-min-one',
                            'Keep at least one day selected, or use “Every day”.',
                          ),
                        );
                        return;
                      }
                      onChange(next);
                    }}
                    className={cn(
                      'min-h-[40px] min-w-[44px] rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                      on
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-border-200 bg-gray-50 text-body hover:border-accent/40 hover:bg-accent/5',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }}
    />
  );
}
