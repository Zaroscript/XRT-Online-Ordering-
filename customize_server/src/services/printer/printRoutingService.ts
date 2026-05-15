import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { PrintTemplateRepository } from '../../infrastructure/repositories/PrintTemplateRepository';
import { PrintJobRepository } from '../../infrastructure/repositories/PrintJobRepository';
import { groupOrderItemsByKitchenSection } from '../../shared/utils/kitchenSectionGrouping';
import { buildTemplateDataFromOrder, renderTemplate } from './templateEngine';
import { Order, OrderItem, OrderPrintStatus } from '../../domain/entities/Order';
import { Printer } from '../../domain/entities/Printer';
import { TemplateLayout } from '../../domain/entities/PrintTemplate';
import { logger } from '../../shared/utils/logger';
import { env } from '../../shared/config/env';
import { sendRenderedTemplatesToPrinter } from './directPrintService';
import { recordPrinterLog } from './printerActivityLogger';
import { Server as SocketIOServer } from 'socket.io';
import { PrintJobNotifier } from './printJobNotifier';

let printJobNotifier: PrintJobNotifier | null = null;

export function setPrintJobNotifier(io: SocketIOServer) {
  printJobNotifier = new PrintJobNotifier(io);
}

const DEFAULT_KITCHEN_LAYOUT: TemplateLayout = {
  header: [
    { type: 'field', value: 'orderNumber' },
    { type: 'field', value: 'createdAt' },
    { type: 'separator' },
  ],
  body: [{ type: 'itemsTable', columns: ['name', 'quantity', 'specialNotes'] }],
  footer: [{ type: 'separator' }, { type: 'field', value: 'notes' }],
};

const orderRepository = new OrderRepository();
const printerRepository = new PrinterRepository();
const printTemplateRepository = new PrintTemplateRepository();
const printJobRepository = new PrintJobRepository();

/** Build base64 ESC/POS buffers for a printer using its assigned templates (or default layout). */
async function renderForPrinter(
  printer: Printer,
  order: Order,
  itemsFilter: OrderItem[]
): Promise<{ templateId: string; renderedContent: string; autoCut: boolean }[]> {
  const templateIds =
    printer.assigned_template_ids && printer.assigned_template_ids.length > 0
      ? printer.assigned_template_ids
      : [null];

  const rendered = [];
  for (const templateId of templateIds) {
    const template = templateId ? await printTemplateRepository.findById(templateId) : null;
    const layout = template?.layout ?? DEFAULT_KITCHEN_LAYOUT;
    const paperWidth = template?.paper_width ?? '80mm';
    const autoCut = template?.autoCut ?? true;
    const data = buildTemplateDataFromOrder(order, { itemsFilter });
    const escPosString = renderTemplate(layout, data, { paperWidth });
    const buffer = Buffer.from(escPosString, 'utf8');
    rendered.push({
      templateId: templateId || 'DEFAULT',
      renderedContent: buffer.toString('base64'),
      autoCut,
    });
  }
  return rendered;
}

/** Dispatch rendered templates to one printer (direct or queue). Updates order print_status. */
async function dispatchToPrinter(
  printer: Printer,
  order: Order,
  renderedTemplates: { templateId: string; renderedContent: string; autoCut: boolean }[]
): Promise<void> {
  if (renderedTemplates.length === 0) return;

  if (env.PRINT_MODE === 'mock') {
    logger.info(
      `[PrintRouting][MOCK] Order ${order.order_number} → ${printer.name} (${renderedTemplates.length} template(s))`
    );
    await orderRepository.updatePrintStatus(order.id, printer.id, 'sent');
    void recordPrinterLog({
      printer_id: printer.id,
      printer_name: printer.name,
      event_type: 'order_mock_print',
      level: 'info',
      message: `Mock print simulated for order ${order.order_number}`,
      order_id: order.id,
      order_number: order.order_number,
      metadata: { templates: renderedTemplates.length },
    });
    return;
  }

  if (env.PRINT_DELIVERY === 'direct') {
    try {
      await sendRenderedTemplatesToPrinter(printer, renderedTemplates);
      await orderRepository.updatePrintStatus(order.id, printer.id, 'sent');
      logger.info(
        `[PrintRouting][DIRECT] Order ${order.order_number} printed on ${printer.name} (${renderedTemplates.length} template(s))`
      );
      void recordPrinterLog({
        printer_id: printer.id,
        printer_name: printer.name,
        event_type: 'order_direct_print',
        level: 'success',
        message: `Direct print succeeded for order ${order.order_number}`,
        order_id: order.id,
        order_number: order.order_number,
        metadata: { templates: renderedTemplates.length },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(
        `[PrintRouting][DIRECT] Order ${order.order_number} print FAILED on ${printer.name}: ${msg}`
      );
      await orderRepository.updatePrintStatus(order.id, printer.id, 'failed', msg);
      void recordPrinterLog({
        printer_id: printer.id,
        printer_name: printer.name,
        event_type: 'order_direct_failed',
        level: 'error',
        message: `Direct print failed for order ${order.order_number}`,
        order_id: order.id,
        order_number: order.order_number,
        error: msg,
        metadata: { templates: renderedTemplates.length },
      });
    }
    return;
  }

  // Queue mode
  const job = await printJobRepository.create({
    orderId: order.id,
    printerId: printer.id,
    maxRetries: printer.maxRetries ?? 3,
    renderedTemplates,
  });
  
  if (printJobNotifier) {
    printJobNotifier.notify(order.business_id, {
      id: job.id,
      renderedTemplates,
      printerInterface: printer.connection_type || 'usb',
    });
  }
  
  await orderRepository.updatePrintStatus(order.id, printer.id, 'sent');
  logger.info(
    `[PrintRouting][QUEUE] Order ${order.order_number} queued for ${printer.name} (${renderedTemplates.length} template(s))`
  );
  void recordPrinterLog({
    printer_id: printer.id,
    printer_name: printer.name,
    event_type: 'order_queued',
    level: 'info',
    message: `Print job queued for order ${order.order_number}`,
    order_id: order.id,
    order_number: order.order_number,
    print_job_id: job.id,
    metadata: { templates: renderedTemplates.length },
  });
}

/**
 * Route an order to all active printers.
 *
 * Two printer types are handled:
 *
 * 1. CASHIER printers (kitchen_sections = []):
 *    Receive the FULL order — all items across all sections, including modifiers.
 *    Use this for the receipt printer at the counter.
 *
 * 2. KITCHEN printers (kitchen_sections = ['Grill', 'Bar', ...]):
 *    Receive only the items belonging to their section(s).
 *    Use this for kitchen display/ticket printers.
 *
 * Duplicate prevention: order.print_status tracks which printers already received a job.
 */
export async function routeOrderToPrinters(orderId: string): Promise<void> {
  if (!orderId) {
    logger.warn('[PrintRouting] orderId is required');
    return;
  }
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      logger.warn(`[PrintRouting] Order not found: ${orderId}`);
      return;
    }

    // Fetch all active printers once
    const allPrinters = await printerRepository.findAll({ active: true });
    if (allPrinters.length === 0) {
      logger.warn(`[PrintRouting] No active printers configured — order ${order.order_number} will not print`);
      return;
    }

    const printedPrinterIds = new Set(
      (order.print_status || [])
        .filter((ps: OrderPrintStatus) => ps.status === 'sent')
        .map((ps: OrderPrintStatus) => ps.printer_id)
    );

    // ── Pass 1: Cashier printers (no sections = full order receipt) ──────────
    const cashierPrinters = allPrinters.filter(
      (p) => !p.kitchen_sections || p.kitchen_sections.length === 0
    );

    for (const printer of cashierPrinters) {
      if (printedPrinterIds.has(printer.id)) continue;
      const rendered = await renderForPrinter(printer, order, order.items);
      await dispatchToPrinter(printer, order, rendered);
      printedPrinterIds.add(printer.id);
    }

    // ── Pass 2: Kitchen printers (section-specific items only) ───────────────
    const sections = groupOrderItemsByKitchenSection(order);
    for (const { sectionName, items } of sections) {
      if (items.length === 0) continue;

      const kitchenPrinters = allPrinters.filter(
        (p) =>
          p.kitchen_sections &&
          p.kitchen_sections.length > 0 &&
          p.kitchen_sections.includes(sectionName)
      );

      if (kitchenPrinters.length === 0) {
        logger.warn(
          `[PrintRouting] No kitchen printer configured for section "${sectionName}" — ${items.length} item(s) skipped`
        );
        continue;
      }

      for (const printer of kitchenPrinters) {
        if (printedPrinterIds.has(printer.id)) continue;
        const rendered = await renderForPrinter(printer, order, items);
        await dispatchToPrinter(printer, order, rendered);
        printedPrinterIds.add(printer.id);
      }
    }
  } catch (err) {
    logger.error(`[PrintRouting] routeOrderToPrinters failed for order ${orderId}:`, err);
  }
}
