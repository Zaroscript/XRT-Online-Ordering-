import {
  TemplateLayout,
  TemplateLayoutBlock,
  PaperWidth,
} from '../../domain/entities/PrintTemplate';
import { Order, OrderItem } from '../../domain/entities/Order';

/** Data passed to the template engine. Keys = printable field names (camelCase). */
export interface TemplateRenderData {
  [key: string]: unknown;
  /** Items for itemsTable blocks; each row is an object with printable column keys */
  items?: Record<string, unknown>[];
}

/** Options for rendering (e.g. paper width for separator length) */
export interface RenderTemplateOptions {
  paperWidth?: PaperWidth;
}

const CHAR_WIDTH_58MM = 32;
const CHAR_WIDTH_80MM = 48;

const ESC = '\x1b';
const ESC_INIT = ESC + '@';
const GS = '\x1d';
const CUT_FULL = GS + 'V\x41\x00'; // GS V A 0 — partial cut, TM-L90 compatible

/**
 * Feed n lines forward using ESC d n.
 * Ensures the last printed line clears the cutter head (~4-5 lines above print head).
 * We use 6 lines as a safe margin for the TM-L90.
 */
const FEED_BEFORE_CUT = ESC + '\x64\x06'; // ESC d 6

/**
 * Renders a dynamic template layout into an ESC/POS-compatible string.
 * No hardcoded templates; everything is driven by layout + data.
 */
export function renderTemplate(
  templateLayout: TemplateLayout,
  data: TemplateRenderData,
  options?: RenderTemplateOptions
): string {
  const paperWidth = options?.paperWidth ?? '80mm';
  const separatorLength = paperWidth === '58mm' ? CHAR_WIDTH_58MM : CHAR_WIDTH_80MM;
  const lines: string[] = [];

  const processBlocks = (blocks: TemplateLayoutBlock[] | undefined) => {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (block.type === 'field') {
        const value = resolveField(block.value, data);
        lines.push(sanitizeLine(String(value ?? '')));
      } else if (block.type === 'itemsTable' && Array.isArray(data.items)) {
        const tableLines = formatItemsTable(data.items, block.columns ?? []);
        lines.push(...tableLines);
      } else if (block.type === 'separator') {
        lines.push(''.padEnd(separatorLength, '-'));
      } else if (block.type === 'line') {
        lines.push(sanitizeLine(block.text ?? ''));
      } else if (block.type === 'logo') {
        // Print NV bit image #1 (FS p 1 0). Printers must have Logo 1 uploaded in NV memory.
        lines.push('\x1C\x70\x01\x00');
      }
    }
  };

  processBlocks(templateLayout.header);
  processBlocks(templateLayout.body);
  processBlocks(templateLayout.footer);

  const body = lines.join('\n');
  // ESC d 6 feeds 6 blank lines to push last content past the cutter head,
  // then GS V A fires the cut. Without this the bottom ~5 lines stay trapped.
  return ESC_INIT + body + '\n' + FEED_BEFORE_CUT + CUT_FULL;
}

/**
 * Resolve a printable field name to a value from data.
 * Handles missing values safely (empty string).
 */
function resolveField(fieldKey: string, data: TemplateRenderData): unknown {
  const value = data[fieldKey];
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return formatDate(value);
  return value;
}

function formatDate(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/** Strip or replace characters that could break ESC/POS or display. */
function sanitizeLine(s: string): string {
  return s.replace(/\r?\n/g, ' ').slice(0, 256);
}

/**
 * Format items as a table: one line per item, columns separated by spaces.
 * Column widths are balanced for readability on narrow paper.
 */
function formatItemsTable(items: Record<string, unknown>[], columns: string[]): string[] {
  if (columns.length === 0) return [];
  const lines: string[] = [];
  for (const item of items) {
    const parts = columns.map((col) => {
      const raw = item[col];
      const s = raw === undefined || raw === null ? '' : String(raw);
      return s.replace(/\r?\n/g, ' ').trim();
    });
    lines.push(parts.join('  ').slice(0, 256));
    // Optionally print modifiers as sub-lines (if present on item)
    const mods = item.modifiers as
      | Array<{ name_snapshot?: string; quantity_label_snapshot?: string }>
      | undefined;
    if (Array.isArray(mods) && mods.length > 0) {
      for (const m of mods) {
        const label = [m.name_snapshot, m.quantity_label_snapshot].filter(Boolean).join(' ');
        if (label) lines.push('  + ' + sanitizeLine(label));
      }
    }
  }
  return lines;
}

/**
 * Build template render data from an order and optional context.
 * Maps entity fields to printable field names (camelCase) for the template engine.
 */
export function buildTemplateDataFromOrder(
  order: Order,
  context?: {
    branchName?: string;
    businessAddress?: string;
    cashierName?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    /** If provided, only these items are included (e.g. for kitchen section) */
    itemsFilter?: OrderItem[];
  }
): TemplateRenderData {
  const items = context?.itemsFilter ?? order.items;
  const delivery = order.delivery;

  const data: TemplateRenderData = {
    orderNumber: order.order_number,
    orderType: order.order_type,
    orderStatus: order.status,
    serviceTimeType: order.service_time_type,
    scheduleTime: order.schedule_time ? formatDate(order.schedule_time) : '',
    readyTime: order.ready_time ? formatDate(order.ready_time) : '',
    actualReadyTime: order.actual_ready_time ? formatDate(order.actual_ready_time) : '',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    notes: order.notes ?? '',
    paymentMethod: order.money.payment,
    currency: order.money.currency,
    subtotal: order.money.subtotal,
    discount: order.money.discount,
    deliveryFee: order.money.delivery_fee,
    taxTotal: order.money.tax_total,
    tips: order.money.tips,
    totalAmount: order.money.total_amount,
    name: delivery?.name ?? context?.customerName ?? '',
    phone: delivery?.phone ?? context?.customerPhone ?? '',
    email: context?.customerEmail ?? '',
    address: formatAddress(delivery?.address),
    branchName: context?.branchName ?? '',
    businessAddress: formatAddress(context?.businessAddress),
    cashierName: context?.cashierName ?? '',
    items: items.map((item) => ({
      name: item.name_snap,
      quantity: item.quantity,
      size: item.size_snap ?? '',
      unitPrice: item.unit_price,
      modifierTotals: item.modifier_totals,
      lineSubtotal: item.line_subtotal,
      specialNotes: item.special_notes ?? '',
      kitchenSection: item.kitchen_section_snapshot ?? '',
      modifiers: item.modifiers,
    })),
  };
  return data;
}

function formatAddress(addr: unknown): string {
  if (addr == null) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object' && addr !== null) {
    const o = addr as Record<string, unknown>;
    const parts = [o.street, o.city, o.state, o.zipCode, o.country].filter(Boolean);
    return parts.join(', ');
  }
  return '';
}
