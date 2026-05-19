import * as net from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { Printer } from '../../domain/entities/Printer';
import { logger } from '../../shared/utils/logger';
import { env } from '../../shared/config/env';
import { listPrintNodePrinters, PrintNodePrinter } from './printNodeService';

const DEFAULT_INTERVAL_MS = 3_000;
// Shorter than the print timeout — status checks just need a TCP handshake
const PING_TIMEOUT_MS = 2_000;

export interface PrinterStatusPayload {
  printerId: string;
  name: string;
  status: string;
  checkedAt: string;
}

/**
 * Lightweight TCP probe: open a socket to host:port, close immediately on connect.
 * Returns true if the port accepts connections within timeoutMs.
 * Does NOT use node-thermal-printer so it never interferes with in-flight print jobs.
 */
function tcpPing(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (result: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

/** Parse host and port out of the stored interface string (e.g. "192.168.1.50" or "tcp://192.168.1.50:9100"). */
function parseHostPort(printer: Printer): { host: string; port: number } | null {
  if (printer.connection_type !== 'lan' && printer.connection_type !== 'wifi') return null;

  const raw = (printer.interface || '').trim().replace(/^tcp:\/\//i, '');
  if (!raw) return null;

  if (raw.includes(':')) {
    const [host, portStr] = raw.split(':');
    const port = parseInt(portStr, 10);
    return isNaN(port) ? null : { host, port };
  }

  return { host: raw, port: 9100 };
}

/**
 * Cache the PrintNode printer list for 60s to avoid hitting the API on every 3s poll cycle.
 */
let printNodeCache: { printers: PrintNodePrinter[]; fetchedAt: number } | null = null;

async function getPrintNodePrintersCached(): Promise<PrintNodePrinter[]> {
  const now = Date.now();
  if (printNodeCache && now - printNodeCache.fetchedAt < 60_000) {
    return printNodeCache.printers;
  }
  try {
    const printers = await listPrintNodePrinters();
    printNodeCache = { printers, fetchedAt: now };
    return printers;
  } catch {
    return printNodeCache?.printers ?? [];
  }
}

/**
 * Check connection for a single printer.
 * - LAN/WiFi: direct TCP ping
 * - PrintNode: resolved via cached PrintNode API list
 * - Bluetooth/serial: skip, return 'unknown'
 */
async function checkPrinter(printer: Printer): Promise<string> {
  // PrintNode: resolve via cloud API
  if (printer.connection_type === 'printnode') {
    if (!printer.printnode_printer_id || !env.PRINTNODE_API_KEY) return 'unknown';
    const list = await getPrintNodePrintersCached();
    const found = list.find((p) => p.id === printer.printnode_printer_id);
    if (!found) return 'disconnected';
    return found.state === 'online' ? 'connected' : 'disconnected';
  }

  const addr = parseHostPort(printer);
  if (!addr) {
    // Non-TCP printer (Bluetooth/serial): skip active probing, mark as unknown
    return 'unknown';
  }

  const reachable = await tcpPing(addr.host, addr.port, PING_TIMEOUT_MS);
  return reachable ? 'connected' : 'disconnected';
}

/**
 * Poll all active printers every intervalMs, update last_status in DB,
 * and emit 'printer-status' to all Socket.io clients.
 *
 * An overlap guard ensures a slow check (e.g. printer unreachable) never
 * stacks up — the next tick is skipped if the previous one is still running.
 */
export function startPrinterStatusMonitor(
  io: SocketIOServer,
  intervalMs: number = DEFAULT_INTERVAL_MS
): NodeJS.Timeout {
  const printerRepository = new PrinterRepository();
  let isRunning = false;

  const checkAll = async () => {
    if (isRunning) return; // skip this tick if previous check is still in progress
    isRunning = true;

    try {
      const printers = await printerRepository.findAll({ active: true });
      if (printers.length === 0) return;

      const payloads: PrinterStatusPayload[] = [];

      await Promise.all(
        printers.map(async (printer) => {
          try {
            const status = await checkPrinter(printer);
            await printerRepository.update(printer.id, { last_status: status });
            payloads.push({
              printerId: printer.id,
              name: printer.name,
              status,
              checkedAt: new Date().toISOString(),
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const short = `error: ${message.slice(0, 120)}`;
            await printerRepository.update(printer.id, { last_status: short });
            payloads.push({
              printerId: printer.id,
              name: printer.name,
              status: 'error',
              checkedAt: new Date().toISOString(),
            });
            logger.warn(`[PrinterStatusMonitor] ${printer.name}: ${message}`);
          }
        })
      );

      if (payloads.length > 0) {
        io.emit('printer-status', { printers: payloads });
      }
    } catch (err) {
      logger.error('[PrinterStatusMonitor] check cycle failed:', err);
    } finally {
      isRunning = false;
    }
  };

  // Run immediately on start, then on interval
  checkAll();
  const intervalId = setInterval(checkAll, intervalMs);
  logger.info(`[PrinterStatusMonitor] Started — polling every ${intervalMs}ms`);
  return intervalId;
}
