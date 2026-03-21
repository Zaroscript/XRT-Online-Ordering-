import { useQuery } from '@tanstack/react-query';
import { printerLogClient } from './client/printer-log';
import { API_ENDPOINTS } from './client/api-endpoints';

export type PrinterLogsQueryParams = {
  page?: number;
  limit?: number;
  printer_id?: string;
  event_type?: string;
  level?: string;
};

export function usePrinterLogsQuery(params: PrinterLogsQueryParams = {}) {
  return useQuery({
    queryKey: [API_ENDPOINTS.PRINTER_LOGS, params],
    queryFn: () => printerLogClient.fetchAll(params),
  });
}

export function usePrinterLogsByPrinterQuery(
  printerId: string | null,
  options?: { enabled?: boolean; limit?: number },
) {
  const enabled = !!printerId && (options?.enabled ?? true);
  const limit = options?.limit ?? 100;
  return useQuery({
    queryKey: [API_ENDPOINTS.PRINTER_LOGS_BY_PRINTER, printerId, limit],
    queryFn: () => printerLogClient.fetchByPrinterId(printerId!, { limit, page: 1 }),
    enabled,
  });
}
