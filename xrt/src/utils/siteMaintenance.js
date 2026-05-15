import { OperationsMode, resolveOperationsState } from "./operations";

export function isMaintenanceBlocking(settings) {
  return resolveOperationsState(settings).mode === OperationsMode.FULL_MAINTENANCE;
}
