import { useMemo } from 'react';
import { useSiteSettingsQuery } from '../api';

/**
 * Converts a 24-hour time string "HH:MM" to a 12-hour readable string.
 * e.g. "13:30" → "1:30 PM"
 */
export function to12Hour(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minute] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

/**
 * Returns the current Date object re-interpreted in the store's configured IANA timezone.
 * This ensures open/closed logic uses the store's local clock, not the customer's browser clock.
 */
function getStoreNow(tz) {
  try {
    // toLocaleString in the store timezone then re-parse gives us the wall-clock time in that zone.
    const storeTimeStr = new Date().toLocaleString('en-US', { timeZone: tz });
    return new Date(storeTimeStr);
  } catch {
    return new Date();
  }
}

/**
 * Returns store open/closed status and the full weekly schedule.
 * Open/closed is evaluated against the store's configured timezone, not the browser's.
 * @returns {{ isOpen: boolean, schedule: Array, todaySlot: object|null }}
 */
export function useStoreStatus() {
  const { data: settings } = useSiteSettingsQuery();
  const schedule = settings?.operating_hours?.schedule ?? [];
  const storeTimezone = settings?.options?.timezone || 'America/New_York';

  const { isOpen, todaySlot } = useMemo(() => {
    if (!schedule.length) return { isOpen: false, todaySlot: null };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = getStoreNow(storeTimezone);
    const currentDayName = days[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todaySlot = schedule.find((s) => s.day === currentDayName) ?? null;

    const isOpen =
      !!todaySlot &&
      !todaySlot.is_closed &&
      currentTime >= todaySlot.open_time &&
      currentTime <= todaySlot.close_time;

    return { isOpen, todaySlot };
  }, [schedule, storeTimezone]);

  return { isOpen, todaySlot, schedule };
}
