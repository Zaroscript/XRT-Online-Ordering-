/**
 * True when the storefront should block browsing (matches admin scheduled maintenance window).
 * - If `isUnderMaintenance` is false → never block.
 * - If start + until are set → block only while now ∈ [start, until).
 * - Otherwise (toggle on but no schedule) → block immediately.
 */
export function isMaintenanceBlocking(settings) {
  if (!settings?.isUnderMaintenance) return false;
  const m = settings.maintenance;
  if (!m || typeof m !== "object") return true;

  const startRaw = m.start;
  const untilRaw = m.until;
  if (startRaw == null || untilRaw == null || startRaw === "" || untilRaw === "") {
    return true;
  }

  const start = new Date(startRaw).getTime();
  const until = new Date(untilRaw).getTime();
  if (Number.isNaN(start) || Number.isNaN(until)) return true;

  const now = Date.now();
  return now >= start && now < until;
}
