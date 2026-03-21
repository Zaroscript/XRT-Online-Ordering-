import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export interface DiscoveredSerialPort {
  interface: string;
  label: string;
}

export interface Printer {
  id: string;
  name: string;
  connection_type: 'lan' | 'wifi' | 'bluetooth';
  interface: string;
  assigned_template_ids: string[];
  kitchen_sections: string[];
  active: boolean;
  last_status: string | null;
  last_printed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrinterListResponse {
  success: boolean;
  message: string;
  data?: Printer[];
}

/** API body from sendSuccess: { success, message, data?: T } */
function unwrapData<T>(body: unknown): T | undefined {
  if (body == null || typeof body !== 'object') return undefined;
  return (body as { data?: T }).data;
}

export const printerClient = {
  fetchPrinters: async (params?: { active?: boolean }) => {
    const body = await HttpClient.get<PrinterListResponse>(
      API_ENDPOINTS.PRINTERS,
      {
        params,
      },
    );
    const list = unwrapData<Printer[]>(body) ?? (Array.isArray(body) ? (body as unknown as Printer[]) : []);
    return Array.isArray(list) ? list : [];
  },
  fetchPrinter: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    const body = await HttpClient.get<{ success: boolean; data?: Printer }>(url);
    return unwrapData<Printer>(body) ?? (body as unknown as Printer);
  },
  create: async (
    input: Partial<Printer> & {
      name: string;
      connection_type: string;
      interface: string;
    },
  ) => {
    const body = await HttpClient.post<{
      success: boolean;
      data?: Printer;
    }>(API_ENDPOINTS.PRINTERS, input);
    return unwrapData<Printer>(body) ?? (body as unknown as Printer);
  },
  update: async (id: string, input: Partial<Printer>) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    const body = await HttpClient.put<{ success: boolean; data?: Printer }>(
      url,
      input,
    );
    return unwrapData<Printer>(body) ?? (body as unknown as Printer);
  },
  testPrint: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_TEST_PRINT.replace(':id', id);
    const data = await HttpClient.post<{ success: boolean }>(url, {});
    return data;
  },
  checkConnection: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_CHECK_CONNECTION.replace(':id', id);
    const body = await HttpClient.post<{
      success: boolean;
      message?: string;
      data?: {
        connected: boolean;
        last_status?: string;
        error?: string;
      };
    }>(url, {});
    return (
      unwrapData<{ connected: boolean; last_status?: string; error?: string }>(body) ?? {
        connected: false,
      }
    );
  },
  scanWiFi: async () => {
    const body = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_WIFI);
    const list = unwrapData<string[]>(body);
    return Array.isArray(list) ? list : [];
  },
  scanLAN: async () => {
    const body = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_LAN);
    const list = unwrapData<string[]>(body);
    return Array.isArray(list) ? list : [];
  },
  scanBluetooth: async () => {
    const body = await HttpClient.get<{
      success: boolean;
      data?: string[];
    }>(API_ENDPOINTS.PRINTER_SCAN_BLUETOOTH);
    const list = unwrapData<string[]>(body);
    return Array.isArray(list) ? list : [];
  },
  discoverSerial: async () => {
    const body = await HttpClient.get<{
      success: boolean;
      data?: DiscoveredSerialPort[];
    }>(API_ENDPOINTS.PRINTER_DISCOVER_SERIAL);
    const list = unwrapData<DiscoveredSerialPort[]>(body);
    return Array.isArray(list) ? list : [];
  },
  delete: async (id: string) => {
    const url = API_ENDPOINTS.PRINTER_DETAIL.replace(':id', id);
    return HttpClient.delete<{ success: boolean; data: null }>(url);
  },
};
