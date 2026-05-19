export type PrinterConnectionType = 'lan' | 'wifi' | 'bluetooth' | 'network' | 'usb' | 'printnode';

export interface Printer {
  id: string;
  name: string;
  connection_type: PrinterConnectionType;
  /** Connection string: tcp://host:port, COM3, or Bluetooth address */
  interface: string;
  ipAddress?: string;
  port?: number;
  usbPort?: string;
  /** References to Templates used for this printer */
  assigned_template_ids: string[];
  /** Kitchen section names this printer serves (multiple sections allowed) */
  kitchen_sections: string[];
  /** PrintNode integer printer ID — only used when connection_type === 'printnode' */
  printnode_printer_id?: number | null;
  active: boolean;
  autoPrint: boolean;
  maxRetries: number;
  last_status: string | null;
  last_printed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePrinterDTO {
  name: string;
  connection_type: PrinterConnectionType;
  interface: string;
  ipAddress?: string;
  port?: number;
  usbPort?: string;
  assigned_template_ids?: string[];
  kitchen_sections?: string[];
  printnode_printer_id?: number | null;
  active?: boolean;
  autoPrint?: boolean;
  maxRetries?: number;
}

export interface UpdatePrinterDTO {
  name?: string;
  connection_type?: PrinterConnectionType;
  interface?: string;
  ipAddress?: string;
  port?: number;
  usbPort?: string;
  assigned_template_ids?: string[];
  kitchen_sections?: string[];
  printnode_printer_id?: number | null;
  active?: boolean;
  autoPrint?: boolean;
  maxRetries?: number;
  last_status?: string | null;
}

export interface PrinterFilters {
  active?: boolean;
  kitchen_section?: string;
}
