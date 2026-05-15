export type PrintJobStatus = 'pending' | 'printing' | 'printed' | 'sent' | 'failed';

export interface RenderedTemplate {
  templateId: string;
  renderedContent: string; // Base64 encoded ESC/POS buffer
  autoCut: boolean;
}

export interface PrintJob {
  id: string;
  orderId: string;
  printerId: string;
  status: PrintJobStatus;
  retryCount: number;
  maxRetries: number;
  renderedTemplates: RenderedTemplate[];
  errorMessage: string | null;
  sentAt: Date | null;
  created_at: Date;
  updated_at: Date;
  lockedAt: Date | null;
}

export interface CreatePrintJobDTO {
  orderId: string;
  printerId: string;
  maxRetries?: number;
  renderedTemplates: RenderedTemplate[];
}

export interface UpdatePrintJobDTO {
  status?: PrintJobStatus;
  retryCount?: number;
  errorMessage?: string | null;
  lockedAt?: Date | null;
  sentAt?: Date | null;
}

export interface PrintJobFilters {
  status?: PrintJobStatus;
  printerId?: string;
  lockedBefore?: Date; // For finding stuck jobs
}
