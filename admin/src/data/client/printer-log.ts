import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export interface PrinterLogRow {
  id: string;
  printer_id: string;
  printer_name: string | null;
  event_type: string;
  level: string;
  message: string;
  order_id: string | null;
  order_number: string | null;
  print_job_id: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PrinterLogsListPayload {
  items: PrinterLogRow[];
  total: number;
  limit: number;
  skip: number;
  page: number;
}

function unwrapData<T>(body: unknown): T | undefined {
  if (body == null || typeof body !== 'object') return undefined;
  return (body as { data?: T }).data;
}

export const printerLogClient = {
  /** Latest-first from API; use reverse() in UI if you want oldest-first. */
  fetchByPrinterId: async (
    printerId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const url = API_ENDPOINTS.PRINTER_LOGS_BY_PRINTER.replace(':id', printerId);
    const body = await HttpClient.get<{
      success: boolean;
      data?: PrinterLogsListPayload;
    }>(url, { params: { ...params, limit: params?.limit ?? 100 } });
    return (
      unwrapData<PrinterLogsListPayload>(body) ?? {
        items: [],
        total: 0,
        limit: 100,
        skip: 0,
        page: 1,
      }
    );
  },

  fetchAll: async (params?: {
    page?: number;
    limit?: number;
    printer_id?: string;
    event_type?: string;
    level?: string;
  }) => {
    const body = await HttpClient.get<{
      success: boolean;
      data?: PrinterLogsListPayload;
    }>(API_ENDPOINTS.PRINTER_LOGS, { params });
    return (
      unwrapData<PrinterLogsListPayload>(body) ?? {
        items: [],
        total: 0,
        limit: 50,
        skip: 0,
        page: 1,
      }
    );
  },
};
