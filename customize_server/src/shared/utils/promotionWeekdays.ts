/**
 * Weekday indices match JavaScript Date: 0 = Sunday … 6 = Saturday.
 * Availability uses the business IANA timezone so “Monday” matches local kitchen hours.
 */

const WEEKDAY_NAME_TO_JS: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function getJsWeekdayInTimeZone(date: Date, timeZone: string): number {
  const tz = (timeZone || 'UTC').trim() || 'UTC';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
    }).formatToParts(date);
    const name = parts.find((p) => p.type === 'weekday')?.value;
    if (name && WEEKDAY_NAME_TO_JS[name] !== undefined) {
      return WEEKDAY_NAME_TO_JS[name];
    }
  } catch {
    // invalid timezone
  }
  const utcParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
  }).formatToParts(date);
  const utcName = utcParts.find((p) => p.type === 'weekday')?.value;
  return utcName && WEEKDAY_NAME_TO_JS[utcName] !== undefined
    ? WEEKDAY_NAME_TO_JS[utcName]
    : date.getUTCDay();
}

/** Empty / missing list = active every day (backward compatible). */
export function promotionAppliesOnWeekday(
  activeWeekdays: number[] | undefined | null,
  now: Date,
  timeZone: string
): boolean {
  const days = activeWeekdays?.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6) ?? [];
  if (days.length === 0) return true;
  const today = getJsWeekdayInTimeZone(now, timeZone);
  return days.includes(today);
}
