import { OperationsMode, OperationsSettings, SettingsOptions } from '@/types';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const OPERATIONS_MODE_OPTIONS: {
  value: OperationsMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'OPEN_NORMAL',
    label: 'Open Normally',
    description: 'ASAP and scheduled orders are available.',
  },
  {
    value: 'SCHEDULED_ONLY',
    label: 'Scheduled Orders Only',
    description: 'ASAP is disabled and scheduled ordering stays active.',
  },
  {
    value: 'ORDERS_PAUSED',
    label: 'Orders Paused',
    description: 'No new online orders are accepted.',
  },
  {
    value: 'FULL_MAINTENANCE',
    label: 'Full Maintenance',
    description: 'Storefront shows the maintenance experience.',
  },
];

export const DEFAULT_OPERATIONS_SETTINGS: OperationsSettings = {
  mode: 'OPEN_NORMAL',
  manualOverride: false,
  overrideUntil: null,
  messageTitle: '',
  messageBody: '',
  showCountdown: true,
  maintenanceTheme: 'restaurant-premium',
  updatedAt: new Date().toISOString(),
};

function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':');
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function getDayName(date: Date) {
  return DAYS[date.getDay()];
}

export function isOpenByWorkingHours(options: SettingsOptions | undefined, at = new Date()) {
  const schedule = options?.operating_hours?.schedule ?? [];
  if (!schedule.length) return true;
  const nowMinutes = at.getHours() * 60 + at.getMinutes();
  const currentDay = getDayName(at);
  const previous = new Date(at);
  previous.setDate(previous.getDate() - 1);
  const prevDay = getDayName(previous);

  const today = schedule.find((item) => item.day === currentDay);
  const yesterday = schedule.find((item) => item.day === prevDay);

  if (today && !today.is_closed) {
    const open = parseTimeToMinutes(today.open_time);
    const close = parseTimeToMinutes(today.close_time);
    if (open !== null && close !== null) {
      if (open <= close && nowMinutes >= open && nowMinutes <= close) return true;
      if (open > close && nowMinutes >= open) return true;
    }
  }

  if (yesterday && !yesterday.is_closed) {
    const open = parseTimeToMinutes(yesterday.open_time);
    const close = parseTimeToMinutes(yesterday.close_time);
    if (open !== null && close !== null && open > close) {
      if (nowMinutes <= close) return true;
    }
  }

  return false;
}

export function normalizeOperationsSettings(
  options: SettingsOptions | undefined,
): OperationsSettings {
  const fromLegacy: OperationsMode = options?.isUnderMaintenance
    ? 'FULL_MAINTENANCE'
    : options?.orders?.accept_orders === false
      ? 'ORDERS_PAUSED'
      : options?.orders?.allowScheduleOrder
        ? 'OPEN_NORMAL'
        : 'ORDERS_PAUSED';

  return {
    ...DEFAULT_OPERATIONS_SETTINGS,
    ...options?.operationsSettings,
    mode: options?.operationsSettings?.mode ?? fromLegacy,
    manualOverride: Boolean(options?.operationsSettings?.manualOverride),
    overrideUntil: options?.operationsSettings?.overrideUntil ?? null,
    messageTitle: options?.operationsSettings?.messageTitle ?? '',
    messageBody: options?.operationsSettings?.messageBody ?? '',
    showCountdown:
      typeof options?.operationsSettings?.showCountdown === 'boolean'
        ? options.operationsSettings.showCountdown
        : true,
    maintenanceTheme:
      options?.operationsSettings?.maintenanceTheme ?? 'restaurant-premium',
    updatedAt: options?.operationsSettings?.updatedAt ?? new Date().toISOString(),
  };
}

export function getResolvedMode(options: SettingsOptions | undefined): {
  mode: OperationsMode;
  reason: 'MANUAL_OVERRIDE' | 'SELECTED_MODE' | 'WORKING_HOURS';
} {
  const ops = normalizeOperationsSettings(options);
  const now = new Date();
  const overrideActive =
    ops.manualOverride &&
    (!ops.overrideUntil || Number.isNaN(new Date(ops.overrideUntil).getTime())
      ? true
      : new Date(ops.overrideUntil).getTime() > now.getTime());

  if (overrideActive) {
    return { mode: ops.mode, reason: 'MANUAL_OVERRIDE' };
  }

  if (ops.mode === 'OPEN_NORMAL' && !isOpenByWorkingHours(options, now)) {
    return { mode: 'SCHEDULED_ONLY', reason: 'WORKING_HOURS' };
  }

  return { mode: ops.mode, reason: 'SELECTED_MODE' };
}

