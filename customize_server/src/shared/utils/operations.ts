type DaySchedule = {
  day: string;
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
};

export type OperationsMode =
  | 'OPEN_NORMAL'
  | 'SCHEDULED_ONLY'
  | 'ORDERS_PAUSED'
  | 'FULL_MAINTENANCE';

export type OperationsReason =
  | 'MANUAL_OVERRIDE'
  | 'SELECTED_MODE'
  | 'WORKING_HOURS';

export type OperationsSettings = {
  mode: OperationsMode;
  manualOverride: boolean;
  overrideUntil: Date | string | null;
  messageTitle: string;
  messageBody: string;
  showCountdown: boolean;
  maintenanceTheme: string;
  updatedAt?: Date | string;
};

type LegacyOrders = {
  accept_orders?: boolean;
  allowScheduleOrder?: boolean;
  deliveredOrderTime?: number;
  maxDays?: number;
};

type LegacySettingsInput = {
  operationsSettings?: Partial<OperationsSettings> | null;
  isUnderMaintenance?: boolean;
  orders?: LegacyOrders;
  operating_hours?: {
    schedule?: DaySchedule[];
  };
};

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DEFAULT_OPERATIONS_SETTINGS: OperationsSettings = {
  mode: 'OPEN_NORMAL',
  manualOverride: false,
  overrideUntil: null,
  messageTitle: '',
  messageBody: '',
  showCountdown: true,
  maintenanceTheme: 'restaurant-premium',
};

function parseTimeToMinutes(value?: string): number | null {
  if (!value || typeof value !== 'string') return null;
  const [h, m] = value.split(':');
  const hours = Number(h);
  const minutes = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function getDayName(date: Date) {
  return DAYS[date.getDay()];
}

function isOverrideActive(overrideUntil: Date | string | null | undefined, now: Date) {
  if (!overrideUntil) return true;
  const until = new Date(overrideUntil).getTime();
  if (Number.isNaN(until)) return true;
  return now.getTime() <= until;
}

export function deriveModeFromLegacy(input: LegacySettingsInput): OperationsMode {
  if (input?.isUnderMaintenance) return 'FULL_MAINTENANCE';
  const acceptOrders = input?.orders?.accept_orders ?? true;
  const allowSchedule = input?.orders?.allowScheduleOrder ?? false;
  if (!acceptOrders && !allowSchedule) return 'ORDERS_PAUSED';
  if (!acceptOrders && allowSchedule) return 'SCHEDULED_ONLY';
  if (acceptOrders && allowSchedule) return 'OPEN_NORMAL';
  return 'ORDERS_PAUSED';
}

export function normalizeOperationsSettings(
  input: LegacySettingsInput,
): OperationsSettings {
  const legacyMode = deriveModeFromLegacy(input);
  const incoming = input?.operationsSettings ?? {};
  return {
    ...DEFAULT_OPERATIONS_SETTINGS,
    ...incoming,
    mode: (incoming.mode as OperationsMode) || legacyMode,
    manualOverride: Boolean(incoming.manualOverride),
    overrideUntil: incoming.overrideUntil ?? null,
    messageTitle: String(incoming.messageTitle ?? ''),
    messageBody: String(incoming.messageBody ?? ''),
    showCountdown:
      typeof incoming.showCountdown === 'boolean'
        ? incoming.showCountdown
        : DEFAULT_OPERATIONS_SETTINGS.showCountdown,
    maintenanceTheme:
      String(incoming.maintenanceTheme || DEFAULT_OPERATIONS_SETTINGS.maintenanceTheme),
    updatedAt: incoming.updatedAt ?? new Date().toISOString(),
  };
}

export function computeLegacyFlagsFromMode(mode: OperationsMode) {
  switch (mode) {
    case 'OPEN_NORMAL':
      return {
        isUnderMaintenance: false,
        accept_orders: true,
        allowScheduleOrder: true,
      };
    case 'SCHEDULED_ONLY':
      return {
        isUnderMaintenance: false,
        accept_orders: true,
        allowScheduleOrder: true,
      };
    case 'ORDERS_PAUSED':
      return {
        isUnderMaintenance: false,
        accept_orders: false,
        allowScheduleOrder: false,
      };
    case 'FULL_MAINTENANCE':
      return {
        isUnderMaintenance: true,
        accept_orders: false,
        allowScheduleOrder: false,
      };
    default:
      return {
        isUnderMaintenance: false,
        accept_orders: true,
        allowScheduleOrder: true,
      };
  }
}

export function isBusinessOpenAt(
  schedule: DaySchedule[] | undefined,
  atDate: Date,
): boolean {
  if (!Array.isArray(schedule) || schedule.length === 0) return true;
  const currentDay = getDayName(atDate);
  const previousDate = new Date(atDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDay = getDayName(previousDate);
  const nowMinutes = atDate.getHours() * 60 + atDate.getMinutes();

  const todaySlot = schedule.find((item) => item.day === currentDay);
  const prevSlot = schedule.find((item) => item.day === previousDay);

  if (todaySlot && !todaySlot.is_closed) {
    const open = parseTimeToMinutes(todaySlot.open_time);
    const close = parseTimeToMinutes(todaySlot.close_time);
    if (open !== null && close !== null) {
      if (open <= close && nowMinutes >= open && nowMinutes <= close) return true;
      if (open > close && nowMinutes >= open) return true;
    }
  }

  if (prevSlot && !prevSlot.is_closed) {
    const prevOpen = parseTimeToMinutes(prevSlot.open_time);
    const prevClose = parseTimeToMinutes(prevSlot.close_time);
    if (prevOpen !== null && prevClose !== null && prevOpen > prevClose) {
      if (nowMinutes <= prevClose) return true;
    }
  }

  return false;
}

export function resolveOperationsState(input: LegacySettingsInput, now = new Date()) {
  const operationsSettings = normalizeOperationsSettings(input);

  const manualActive =
    operationsSettings.manualOverride &&
    isOverrideActive(operationsSettings.overrideUntil, now);

  let mode: OperationsMode = operationsSettings.mode;
  let reason: OperationsReason = manualActive ? 'MANUAL_OVERRIDE' : 'SELECTED_MODE';

  if (!manualActive && mode !== 'FULL_MAINTENANCE') {
    const isOpenNow = isBusinessOpenAt(input?.operating_hours?.schedule, now);
    if (!isOpenNow && mode === 'OPEN_NORMAL') {
      mode = 'SCHEDULED_ONLY';
      reason = 'WORKING_HOURS';
    }
  }

  const flags = computeLegacyFlagsFromMode(mode);

  return {
    mode,
    reason,
    operationsSettings,
    isMaintenance: mode === 'FULL_MAINTENANCE',
    acceptsAsap: mode === 'OPEN_NORMAL',
    acceptsScheduled: mode === 'OPEN_NORMAL' || mode === 'SCHEDULED_ONLY',
    ...flags,
  };
}

export function isScheduledTimeAllowed(
  input: LegacySettingsInput,
  scheduleTime: Date,
  now = new Date(),
) {
  const target = new Date(scheduleTime);
  if (Number.isNaN(target.getTime())) return false;
  if (target.getTime() <= now.getTime()) return false;

  const prepMinutes = Number(input?.orders?.deliveredOrderTime ?? 0);
  const minimumAllowed = new Date(now.getTime() + prepMinutes * 60 * 1000);
  if (target.getTime() < minimumAllowed.getTime()) return false;

  const maxDays = Number(input?.orders?.maxDays ?? 0);
  if (Number.isFinite(maxDays) && maxDays > 0) {
    const upperBound = new Date(now);
    upperBound.setHours(23, 59, 59, 999);
    upperBound.setDate(upperBound.getDate() + maxDays);
    if (target.getTime() > upperBound.getTime()) return false;
  }

  return isBusinessOpenAt(input?.operating_hours?.schedule, target);
}
