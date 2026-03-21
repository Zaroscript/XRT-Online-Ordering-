export type PrinterLogLevel = 'info' | 'success' | 'warn' | 'error';

/** What triggered the log entry */
export type PrinterLogEventType =
  | 'order_direct_print'
  | 'order_direct_failed'
  | 'order_queued'
  | 'order_mock_print'
  | 'test_direct_print'
  | 'test_direct_failed'
  | 'test_queued'
  | 'test_mock_print'
  | 'connection_check';

export interface PrinterLog {
  id: string;
  printer_id: string;
  printer_name: string | null;
  event_type: PrinterLogEventType;
  level: PrinterLogLevel;
  message: string;
  order_id: string | null;
  order_number: string | null;
  print_job_id: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface CreatePrinterLogDTO {
  printer_id: string;
  printer_name?: string | null;
  event_type: PrinterLogEventType;
  level: PrinterLogLevel;
  message: string;
  order_id?: string | null;
  order_number?: string | null;
  print_job_id?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PrinterLogQueryFilters {
  printer_id?: string;
  event_type?: string;
  level?: string;
}
