import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { PrintJobRepository } from '../../infrastructure/repositories/PrintJobRepository';
import { createPrinterInstance } from '../../services/printer/printerFactory';
import {
  scanForPrinters,
  scanLAN as discoverNetworkPrinters,
  scanBluetooth as discoverBluetoothDevices,
  discoverSerialPorts as discoverSerialPortsOnHost,
} from '../../services/printer/printerScanner';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AppError, NotFoundError } from '../../shared/errors/AppError';
import { env } from '../../shared/config/env';
import { sendRenderedTemplatesToPrinter } from '../../services/printer/directPrintService';
import { recordPrinterLog } from '../../services/printer/printerActivityLogger';
import { notifyQueuedPrintJob } from '../../services/printer/printRoutingService';
import { submitPrintNodeJob, listPrintNodePrinters, pingPrintNode } from '../../services/printer/printNodeService';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';

const ESC_INIT = '\x1b\x40';

export class PrinterController {
  private repository: PrinterRepository;

  constructor() {
    this.repository = new PrinterRepository();
  }

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const active = req.query.active as string | undefined;
    const filters: any = {};
    if (active !== undefined) filters.active = active === 'true';
    const printers = await this.repository.findAll(filters);
    return sendSuccess(res, 'Printers retrieved', printers);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer retrieved', printer);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const created = await this.repository.create({
      name: body.name,
      connection_type: body.connection_type,
      interface: body.interface ?? '',
      assigned_template_ids: body.assigned_template_ids ?? [],
      kitchen_sections: body.kitchen_sections ?? [],
      printnode_printer_id: body.printnode_printer_id ? Number(body.printnode_printer_id) : null,
      active: body.active !== false,
    });
    return sendSuccess(res, 'Printer created', created, 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');
    const body = req.body;
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.connection_type !== undefined) updateData.connection_type = body.connection_type;
    if (body.interface !== undefined) updateData.interface = body.interface;
    if (body.assigned_template_ids !== undefined)
      updateData.assigned_template_ids = body.assigned_template_ids;
    if (body.kitchen_sections !== undefined) updateData.kitchen_sections = body.kitchen_sections;
    if (body.printnode_printer_id !== undefined)
      updateData.printnode_printer_id = body.printnode_printer_id ? Number(body.printnode_printer_id) : null;
    if (body.active !== undefined) updateData.active = body.active;
    const updated = await this.repository.update(id, updateData);
    if (!updated) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer updated', updated);
  });

  /**
   * POST /printers/:id/test-print
   * PRINT_DELIVERY=direct + PRINT_MODE=production: prints immediately from API (no agent).
   * Otherwise: enqueues a PrintJob (worker/agent required).
   */
  testPrint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');

    const CUT    = '\x1d\x56\x41\x00'; // GS V A 0 — partial cut
    const FEED   = '\x1b\x64\x06';     // ESC d 6  — feed 6 lines past cutter head
    const testLine = 'Test print - ' + new Date().toISOString() + '\n';
    const buffer = Buffer.from(ESC_INIT + testLine + FEED + CUT, 'utf8');

    const renderedTemplates = [
      {
        templateId: 'TEST_PRINT',
        renderedContent: buffer.toString('base64'),
        autoCut: true,
      },
    ];

    if (env.PRINT_MODE === 'mock') {
      void recordPrinterLog({
        printer_id: printer.id,
        printer_name: printer.name,
        event_type: 'test_mock_print',
        level: 'info',
        message: 'Test print simulated (PRINT_MODE=mock)',
      });
      return sendSuccess(res, 'Test print simulated (PRINT_MODE=mock)', {
        printerId: id,
        delivery: 'mock',
      });
    }

    // ── PrintNode test-print ────────────────────────────────────────────
    if (printer.connection_type === 'printnode') {
      if (!printer.printnode_printer_id) {
        throw new AppError('This printer has no PrintNode Printer ID configured.', 400);
      }
      const CUT_SEQ = Buffer.from([0x1d, 0x56, 0x41, 0x00]);
      const combinedBuffer = Buffer.concat(
        renderedTemplates.map((rt, idx) => {
          const buf = Buffer.from(rt.renderedContent, 'base64');
          const isLast = idx === renderedTemplates.length - 1;
          if (isLast) return buf;
          if (buf.length >= CUT_SEQ.length && buf.slice(buf.length - CUT_SEQ.length).equals(CUT_SEQ)) {
            return buf.slice(0, buf.length - CUT_SEQ.length);
          }
          return buf;
        })
      );
      try {
        const jobId = await submitPrintNodeJob({
          printNodePrinterId: printer.printnode_printer_id,
          title: `Test Print — ${printer.name} — ${new Date().toISOString()}`,
          contentBase64: combinedBuffer.toString('base64'),
        });
        void recordPrinterLog({
          printer_id: printer.id,
          printer_name: printer.name,
          event_type: 'test_printnode_print',
          level: 'success',
          message: 'PrintNode test print submitted',
          metadata: { printNodeJobId: jobId },
        });
        return sendSuccess(res, 'Test print sent via PrintNode', {
          printerId: id,
          delivery: 'printnode',
          printNodeJobId: jobId,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        void recordPrinterLog({
          printer_id: printer.id,
          printer_name: printer.name,
          event_type: 'test_printnode_failed',
          level: 'error',
          message: 'PrintNode test print failed',
          error: msg,
        });
        throw new AppError(`PrintNode test print failed: ${msg}`, 502);
      }
    }

    if (env.PRINT_DELIVERY === 'direct') {
      try {
        await sendRenderedTemplatesToPrinter(printer, renderedTemplates);
        void recordPrinterLog({
          printer_id: printer.id,
          printer_name: printer.name,
          event_type: 'test_direct_print',
          level: 'success',
          message: 'Test print sent directly to printer',
        });
        return sendSuccess(res, 'Test print sent directly to printer', {
          printerId: id,
          delivery: 'direct',
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        void recordPrinterLog({
          printer_id: printer.id,
          printer_name: printer.name,
          event_type: 'test_direct_failed',
          level: 'error',
          message: 'Direct test print failed',
          error: msg,
        });
        throw new AppError(`Direct test print failed: ${msg}`, 502);
      }
    }

    const printJobRepository = new PrintJobRepository();
    const job = await printJobRepository.create({
      orderId: `TEST-${Date.now()}`,
      printerId: printer.id,
      maxRetries: printer.maxRetries ?? 1,
      renderedTemplates,
    });

    void recordPrinterLog({
      printer_id: printer.id,
      printer_name: printer.name,
      event_type: 'test_queued',
      level: 'info',
      message: 'Test print job queued',
      print_job_id: job.id,
    });

    const businessRepository = new BusinessRepository();
    const business = await businessRepository.findOne();
    if (business) {
      notifyQueuedPrintJob(business.id, {
        id: job.id,
        renderedTemplates: job.renderedTemplates,
        printerInterface: printer.interface,
      });
    }

    return sendSuccess(res, 'Test print queued successfully', {
      printerId: id,
      printJobId: job.id,
      delivery: 'queue',
    });
  });

  /**
   * POST /printers/:id/check-connection
   * Probes printer reachability from the API server (TCP/COM/etc.) via node-thermal-printer.
   * Updates last_status on the printer record.
   */
  checkConnection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');

    // ── PrintNode: check via PrintNode API, not TCP ───────────────────────
    if (printer.connection_type === 'printnode') {
      if (!printer.printnode_printer_id) {
        return sendSuccess(res, 'PrintNode printer has no Printer ID configured', {
          connected: false,
          last_status: 'misconfigured',
          error: 'Missing printnode_printer_id',
        });
      }
      try {
        const printers = await listPrintNodePrinters();
        const found = printers.find((p) => p.id === printer.printnode_printer_id);
        const status = found?.state === 'online' ? 'connected' : 'disconnected';
        await this.repository.update(printer.id, { last_status: status });
        void recordPrinterLog({
          printer_id: printer.id,
          printer_name: printer.name,
          event_type: 'connection_check',
          level: status === 'connected' ? 'success' : 'warn',
          message: `PrintNode check: ${found ? found.state : 'printer not found on account'}`,
          metadata: { printNodePrinterId: printer.printnode_printer_id, state: found?.state },
        });
        return sendSuccess(
          res,
          status === 'connected'
            ? 'PrintNode printer is online'
            : 'PrintNode printer is offline or not found',
          { connected: status === 'connected', last_status: status, printNodeState: found?.state }
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await this.repository.update(printer.id, { last_status: 'error' });
        return sendSuccess(res, `PrintNode API check failed: ${msg}`, { connected: false, error: msg });
      }
    }

    try {
      const instance = createPrinterInstance(printer);
      const connected = await instance.isConnected();
      const status = connected ? 'connected' : 'disconnected';
      await this.repository.update(printer.id, { last_status: status });
      void recordPrinterLog({
        printer_id: printer.id,
        printer_name: printer.name,
        event_type: 'connection_check',
        level: connected ? 'success' : 'warn',
        message: connected
          ? 'Connection check: printer reachable'
          : 'Connection check: printer did not respond',
        metadata: { connected, last_status: status },
      });
      return sendSuccess(
        res,
        connected
          ? 'Printer is reachable from the server'
          : 'Printer did not respond (check IP/COM and that the server can reach this device)',
        { connected, last_status: status }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const short = `error: ${message.slice(0, 200)}`;
      await this.repository.update(printer.id, { last_status: short });
      void recordPrinterLog({
        printer_id: printer.id,
        printer_name: printer.name,
        event_type: 'connection_check',
        level: 'error',
        message: 'Connection check raised an error',
        error: message,
        metadata: { last_status: short },
      });
      return sendSuccess(res, 'Connection check failed', {
        connected: false,
        last_status: short,
        error: message,
      });
    }
  });

  /** GET /printers/scan — scan local network for printers */
  scanWiFi = asyncHandler(async (req: AuthRequest, res: Response) => {
    const printers = await scanForPrinters(9100, 1500);
    return sendSuccess(res, 'Scanned network for printers', printers);
  });
  /** GET /printers/scan-lan — scan local network for LAN printers */
  scanLAN = asyncHandler(async (req: AuthRequest, res: Response) => {
    const printers = await discoverNetworkPrinters(9100, 1500);
    return sendSuccess(res, 'Scanned network for LAN printers', printers);
  });

  /** GET /printers/scan-bluetooth — scan locally paired bluetooth devices */
  scanBluetooth = asyncHandler(async (req: AuthRequest, res: Response) => {
    const devices = await discoverBluetoothDevices();
    return sendSuccess(res, 'Scanned for Bluetooth devices', devices);
  });

  /**
   * GET /printers/discover-serial — COM / USB-serial / tty* on the API host (structured).
   * Use this so the admin UI can fill Interface without typing.
   */
  discoverSerial = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ports = await discoverSerialPortsOnHost();
    return sendSuccess(
      res,
      ports.length
        ? `Found ${ports.length} serial-style port(s) on API host`
        : 'No serial/USB COM ports detected on API host',
      ports
    );
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer deleted');
  });

  /**
   * GET /printers/printnode-printers
   * Returns the list of printers visible to this PrintNode account.
   * Use this in the admin UI so staff can pick the correct PrintNode Printer ID.
   */
  listPrintNodePrinters = asyncHandler(async (_req: AuthRequest, res: Response) => {
    try {
      const printers = await listPrintNodePrinters();
      return sendSuccess(res, `Found ${printers.length} PrintNode printer(s)`, printers);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AppError(`Failed to list PrintNode printers: ${msg}`, 502);
    }
  });

  /**
   * GET /printers/printnode-status
   * Health-check: verifies PRINTNODE_API_KEY is valid and PrintNode API is reachable.
   */
  checkPrintNodeStatus = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await pingPrintNode();
    if (result.ok) {
      return sendSuccess(res, 'PrintNode API is reachable', { ok: true, accountId: result.accountId });
    }
    return sendSuccess(res, 'PrintNode API check failed', { ok: false, error: result.error });
  });
}
