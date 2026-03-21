import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { PrintTemplateRepository } from '../../infrastructure/repositories/PrintTemplateRepository';
import { PrintJobRepository } from '../../infrastructure/repositories/PrintJobRepository';
import { groupOrderItemsByKitchenSection } from '../../shared/utils/kitchenSectionGrouping';
import { buildTemplateDataFromOrder, renderTemplate } from './templateEngine';
import { OrderPrintStatus } from '../../domain/entities/Order';
import { TemplateLayout } from '../../domain/entities/PrintTemplate';
import { logger } from '../../shared/utils/logger';
import { env } from '../../shared/config/env';
import { sendRenderedTemplatesToPrinter } from './directPrintService';
import { recordPrinterLog } from './printerActivityLogger';

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

/**
 * Route an order to all active printers for each kitchen section.
 * Groups items by section, finds printers per section, renders template,
 * In queue mode: stores PrintJobs for a worker to claim.
 * In direct mode (PRINT_DELIVERY=direct): prints immediately from the API server.
 * Uses order.print_status to avoid duplicate PrintJob assignments.
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

    const sections = groupOrderItemsByKitchenSection(order);
    const printedPrinterIds = new Set(
      (order.print_status || [])
        .filter((ps: OrderPrintStatus) => ps.status === 'sent')
        .map((ps: OrderPrintStatus) => ps.printer_id)
    );

    for (const { sectionName, items } of sections) {
      if (items.length === 0) continue;

      const printers = await printerRepository.findAll({
        active: true,
        kitchen_section: sectionName,
      });

      for (const printer of printers) {
        if (printedPrinterIds.has(printer.id)) continue;

        const templateIds =
          printer.assigned_template_ids && printer.assigned_template_ids.length > 0
            ? printer.assigned_template_ids
            : [null];

        const renderedTemplates = [];

        for (const templateId of templateIds) {
          const template = templateId ? await printTemplateRepository.findById(templateId) : null;
          const layout = template?.layout ?? DEFAULT_KITCHEN_LAYOUT;
          const paperWidth = template?.paper_width ?? '80mm';
          const autoCut = template?.autoCut ?? true;
          const data = buildTemplateDataFromOrder(order, { itemsFilter: items });
          const escPosString = renderTemplate(layout, data, { paperWidth });
          const buffer = Buffer.from(escPosString, 'utf8');

          renderedTemplates.push({
            templateId: templateId || 'DEFAULT',
            renderedContent: buffer.toString('base64'),
            autoCut,
          });
        }

        let routedOk = false;

        if (renderedTemplates.length > 0) {
          if (env.PRINT_MODE === 'mock') {
            logger.info(
              `[PrintRouting][MOCK MODE] Order ${order.order_number} simulated print to ${printer.name} (${printer.id}) with ${renderedTemplates.length} templates`
            );
            await orderRepository.updatePrintStatus(orderId, printer.id, 'sent');
            routedOk = true;
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
          } else if (env.PRINT_DELIVERY === 'direct') {
            try {
              await sendRenderedTemplatesToPrinter(printer, renderedTemplates);
              await orderRepository.updatePrintStatus(orderId, printer.id, 'sent');
              routedOk = true;
              logger.info(
                `[PrintRouting][DIRECT] Order ${order.order_number} printed on ${printer.name} (${printer.id}), ${renderedTemplates.length} template(s)`
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
                `[PrintRouting][DIRECT] Order ${order.order_number} print failed on ${printer.name} (${printer.id}): ${msg}`,
                err
              );
              await orderRepository.updatePrintStatus(orderId, printer.id, 'failed', msg);
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
          } else {
            const job = await printJobRepository.create({
              orderId: order.id,
              printerId: printer.id,
              maxRetries: printer.maxRetries ?? 3,
              renderedTemplates,
            });

            await orderRepository.updatePrintStatus(orderId, printer.id, 'sent');
            routedOk = true;

            logger.info(
              `[PrintRouting] Order ${order.order_number} queued for printer ${printer.name} (${printer.id}) with ${renderedTemplates.length} templates`
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
        }

        if (renderedTemplates.length === 0 || routedOk) {
          printedPrinterIds.add(printer.id);
        }
      }
    }
  } catch (err) {
    logger.error(`[PrintRouting] routeOrderToPrinters failed for order ${orderId}:`, err);
  }
}
