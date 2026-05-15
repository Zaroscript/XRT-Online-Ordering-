const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const OperationsMode = {
  OPEN_NORMAL: "OPEN_NORMAL",
  SCHEDULED_ONLY: "SCHEDULED_ONLY",
  ORDERS_PAUSED: "ORDERS_PAUSED",
  FULL_MAINTENANCE: "FULL_MAINTENANCE",
};

export function normalizeOperationsSettings(settings = {}) {
  const legacyMode = settings?.isUnderMaintenance
    ? OperationsMode.FULL_MAINTENANCE
    : settings?.orders?.accept_orders === false
      ? OperationsMode.ORDERS_PAUSED
      : settings?.orders?.allowScheduleOrder
        ? OperationsMode.OPEN_NORMAL
        : OperationsMode.ORDERS_PAUSED;

  return {
    mode: settings?.operationsSettings?.mode || legacyMode,
    manualOverride: Boolean(settings?.operationsSettings?.manualOverride),
    overrideUntil: settings?.operationsSettings?.overrideUntil ?? null,
    messageTitle: settings?.operationsSettings?.messageTitle || "",
    messageBody: settings?.operationsSettings?.messageBody || "",
    showCountdown:
      typeof settings?.operationsSettings?.showCountdown === "boolean"
        ? settings.operationsSettings.showCountdown
        : true,
    maintenanceTheme:
      settings?.operationsSettings?.maintenanceTheme || "restaurant-premium",
  };
}

function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return null;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayName(date) {
  return DAYS[date.getDay()];
}

function isOverrideActive(overrideUntil, now) {
  if (!overrideUntil) return true;
  const timestamp = new Date(overrideUntil).getTime();
  if (Number.isNaN(timestamp)) return true;
  return timestamp > now.getTime();
}

export function isBusinessOpenAt(schedule = [], atDate = new Date()) {
  if (!Array.isArray(schedule) || schedule.length === 0) return true;
  const nowMinutes = atDate.getHours() * 60 + atDate.getMinutes();
  const currentDay = getDayName(atDate);
  const prevDate = new Date(atDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDay = getDayName(prevDate);

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

export function resolveOperationsState(settings = {}, now = new Date()) {
  const operations = normalizeOperationsSettings(settings);
  const manualActive =
    operations.manualOverride && isOverrideActive(operations.overrideUntil, now);

  let mode = operations.mode;
  let reason = manualActive ? "MANUAL_OVERRIDE" : "SELECTED_MODE";

  if (!manualActive && mode === OperationsMode.OPEN_NORMAL) {
    const open = isBusinessOpenAt(settings?.operating_hours?.schedule || [], now);
    if (!open) {
      mode = OperationsMode.SCHEDULED_ONLY;
      reason = "WORKING_HOURS";
    }
  }

  return {
    mode,
    reason,
    acceptsAsap: mode === OperationsMode.OPEN_NORMAL,
    acceptsScheduled:
      mode === OperationsMode.OPEN_NORMAL || mode === OperationsMode.SCHEDULED_ONLY,
    allowsCheckout:
      mode === OperationsMode.OPEN_NORMAL || mode === OperationsMode.SCHEDULED_ONLY,
    isMaintenance: mode === OperationsMode.FULL_MAINTENANCE,
    operations,
  };
}

function getScheduleEntryForDate(schedule, date) {
  const dayName = getDayName(date);
  return schedule.find((entry) => entry.day === dayName);
}

function isDateBookable(schedule, date) {
  const entry = getScheduleEntryForDate(schedule, date);
  if (!entry || entry.is_closed) return false;
  const open = parseTimeToMinutes(entry.open_time);
  const close = parseTimeToMinutes(entry.close_time);
  return open !== null && close !== null;
}

function resolveMaxDays(maxDays) {
  const parsed = Number(maxDays);
  if (!Number.isFinite(parsed)) return 30;
  if (parsed < 0) return 30;
  return parsed;
}

export function formatDateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function parseDateValue(value) {
  if (!value || typeof value !== "string") return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(y, m - 1, d);
}

export function formatDateLabel(date) {
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeLabel(timeValue) {
  if (!timeValue) return "";
  const [hourRaw, minuteRaw] = timeValue.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return timeValue;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function getAvailableDates(settings = {}, config = {}) {
  const schedule = settings?.operating_hours?.schedule || [];
  const maxDays = resolveMaxDays(
    config?.maxDays ?? settings?.orders?.maxDays ?? 30,
  );
  const limitOpenDays = Number(config?.limitOpenDays ?? 90);
  const openDaysLimit = Number.isFinite(limitOpenDays) && limitOpenDays > 0 ? limitOpenDays : 90;
  const maxSearchDays = maxDays === 0 ? 3650 : Math.max(maxDays, 1);

  const dates = [];
  const today = startOfDay(new Date());
  for (
    let i = 0;
    i < maxSearchDays && dates.length < openDaysLimit;
    i += 1
  ) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (isDateBookable(schedule, date)) {
      dates.push(date);
    }
  }
  return dates;
}

export function isDateSelectable(settings = {}, date, now = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  const targetDay = startOfDay(date);
  const today = startOfDay(now);
  if (targetDay.getTime() < today.getTime()) return false;

  const maxDays = resolveMaxDays(settings?.orders?.maxDays ?? 30);
  if (maxDays > 0) {
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);
    if (targetDay.getTime() > maxDate.getTime()) return false;
  }

  const schedule = settings?.operating_hours?.schedule || [];
  return isDateBookable(schedule, targetDay);
}

export function getDateInputBounds(settings = {}, now = new Date()) {
  const today = startOfDay(now);
  const min = formatDateValue(today);
  const maxDays = resolveMaxDays(settings?.orders?.maxDays ?? 30);
  if (maxDays <= 0) {
    return { min, max: undefined };
  }
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);
  return { min, max: formatDateValue(maxDate) };
}

export function getAvailableTimeSlots(settings = {}, date, interval = 15) {
  if (!date) return [];
  const schedule = settings?.operating_hours?.schedule || [];
  const entry = getScheduleEntryForDate(schedule, date);
  if (!entry || entry.is_closed) return [];

  const open = parseTimeToMinutes(entry.open_time);
  const close = parseTimeToMinutes(entry.close_time);
  if (open === null || close === null) return [];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isSameDay = now.toDateString() === date.toDateString();
  const prepBuffer = Number(settings?.orders?.deliveredOrderTime || 25);
  const minimumMinute = isSameDay ? nowMinutes + prepBuffer : 0;

  const slots = [];
  const pushSlot = (minutes) => {
    if (minutes < minimumMinute) return;
    const hour = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  };

  if (open <= close) {
    for (let minute = open; minute <= close; minute += interval) pushSlot(minute);
  } else {
    for (let minute = open; minute < 24 * 60; minute += interval) pushSlot(minute);
    for (let minute = 0; minute <= close; minute += interval) pushSlot(minute);
  }

  return slots;
}
