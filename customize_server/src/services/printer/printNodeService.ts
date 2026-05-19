import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';

const PRINTNODE_BASE_URL = 'https://api.printnode.com';

// ── Auth ────────────────────────────────────────────────────────────────────

function getAuthHeader(): string {
  if (!env.PRINTNODE_API_KEY) {
    throw new Error('PRINTNODE_API_KEY is not configured in environment variables.');
  }
  const encoded = Buffer.from(`${env.PRINTNODE_API_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface PrintNodePrinter {
  id: number;
  name: string;
  description: string;
  state: 'online' | 'offline' | string;
  computer: { id: number; name: string };
}

export interface PrintNodeJobInput {
  /** PrintNode integer printer ID stored on the Printer record */
  printNodePrinterId: number;
  /** Human-readable title for the job (e.g. "Order #1042 — Cashier") */
  title: string;
  /** Base64-encoded ESC/POS buffer — exactly what templateEngine.ts produces */
  contentBase64: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * Submit a raw ESC/POS print job to PrintNode.
 * Returns the PrintNode job ID (integer) on success.
 * Throws on HTTP or network error.
 */
export async function submitPrintNodeJob(input: PrintNodeJobInput): Promise<number> {
  const body = JSON.stringify({
    printerId: input.printNodePrinterId,
    title: input.title,
    contentType: 'raw_base64',
    content: input.contentBase64,
    source: 'XRT-POS',
  });

  const response = await fetch(`${PRINTNODE_BASE_URL}/printjobs`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PrintNode API error ${response.status}: ${text}`);
  }

  const jobId = (await response.json()) as number;
  logger.info(`[PrintNode] Job submitted → printNodeJobId=${jobId} printer=${input.printNodePrinterId}`);
  return jobId;
}

/**
 * Fetch all printers visible to this PrintNode account.
 * Use this in the admin UI to let staff pick the correct printer ID.
 */
export async function listPrintNodePrinters(): Promise<PrintNodePrinter[]> {
  const response = await fetch(`${PRINTNODE_BASE_URL}/printers`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PrintNode printers fetch failed ${response.status}: ${text}`);
  }

  return response.json() as Promise<PrintNodePrinter[]>;
}

/**
 * Quick health check — returns true when the API key is valid and PrintNode responds.
 */
export async function pingPrintNode(): Promise<{ ok: boolean; accountId?: number; error?: string }> {
  try {
    const response = await fetch(`${PRINTNODE_BASE_URL}/whoami`, {
      headers: { Authorization: getAuthHeader() },
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data = (await response.json()) as { id: number };
    return { ok: true, accountId: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
