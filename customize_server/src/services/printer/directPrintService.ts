import { Printer } from '../../domain/entities/Printer';
import { createPrinterInstance } from './printerFactory';

const DEFAULT_RAW_TIMEOUT_MS = 30_000;

export type RenderedTemplatePayload = {
  renderedContent: string;
  autoCut?: boolean;
};

/**
 * Send pre-rendered ESC/POS (base64) to a printer from the API process.
 * Used when PRINT_DELIVERY=direct so no separate print agent is required
 * (server must be able to reach the printer: LAN or COM on same host).
 */
export async function sendRenderedTemplatesToPrinter(
  printer: Printer,
  renderedTemplates: RenderedTemplatePayload[],
  rawTimeoutMs: number = DEFAULT_RAW_TIMEOUT_MS
): Promise<void> {
  if (!renderedTemplates.length) return;

  const instance = createPrinterInstance(printer);
  for (const rt of renderedTemplates) {
    const buf = Buffer.from(rt.renderedContent, 'base64');
    await instance.rawWithTimeout(buf, rawTimeoutMs);
  }
}
