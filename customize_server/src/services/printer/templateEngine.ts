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

const ESC           = '\x1b';
const ESC_INIT      = ESC + '@';          // Initialize printer
const ESC_BOLD_ON   = ESC + 'E\x01';     // Bold on
const ESC_BOLD_OFF  = ESC + 'E\x00';     // Bold off
const ESC_ALIGN_C   = ESC + 'a\x01';     // Center align
const ESC_ALIGN_L   = ESC + 'a\x00';     // Left align
const GS            = '\x1d';
const CUT_FULL      = GS + 'V\x41\x00'; // GS V A 0 — partial cut, TM-L90 compatible
const FEED_BEFORE_CUT = ESC + '\x64\x06'; // ESC d 6 — feed 6 lines past cutter head

/** Human-readable labels for field keys printed on receipts */
const FIELD_LABELS: Record<string, string> = {
  orderNumber:      'Order #',
  orderType:        'Type',
  orderStatus:      'Status',
  serviceTimeType:  'Service',
  scheduleTime:     'Scheduled',
  readyTime:        'Ready At',
  actualReadyTime:  'Actual Ready',
  createdAt:        'Date',
  updatedAt:        'Updated',
  notes:            'Notes',
  paymentMethod:    'Payment',
  currency:         'Currency',
  subtotal:         'Subtotal',
  discount:         'Discount',
  deliveryFee:      'Delivery Fee',
  taxTotal:         'Tax',
  tips:             'Tips',
  totalAmount:      'TOTAL',
  name:             'Customer',
  phone:            'Phone',
  email:            'Email',
  address:          'Address',
  branchName:       'Branch',
  businessAddress:  'Store Address',
  cashierName:      'Cashier',
};

/** Fields that represent monetary values — format with 2 decimal places */
const MONEY_FIELDS = new Set([
  'subtotal', 'discount', 'deliveryFee', 'taxTotal',
  'tips', 'totalAmount',
]);

/**
 * Renders a dynamic template layout into an ESC/POS-compatible byte string.
 * - Skips empty fields so blank lines don't waste paper
 * - Formats dates, labels, and currency values
 * - Logo block safely ignored if no NV image stored (avoids printer hang)
 * - Feeds paper past cutter head before firing cut
 */
export function renderTemplate(
  templateLayout: TemplateLayout,
  data: TemplateRenderData,
  options?: RenderTemplateOptions
): string {
  const paperWidth = options?.paperWidth ?? '80mm';
  const charWidth  = paperWidth === '58mm' ? CHAR_WIDTH_58MM : CHAR_WIDTH_80MM;
  const parts: string[] = [ESC_INIT];

  const processBlocks = (blocks: TemplateLayoutBlock[] | undefined) => {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (block.type === 'field') {
        const raw = resolveField(block.value, data);
        if (raw === '' || raw === null || raw === undefined) continue; // skip empty
        const label  = FIELD_LABELS[block.value] ?? block.value;
        const value  = formatFieldValue(block.value, raw);
        const isTotl = block.value === 'totalAmount';
        if (isTotl) {
          // TOTAL line — bold + separator
          parts.push(''.padEnd(charWidth, '-') + '\n');
          parts.push(ESC_BOLD_ON + formatLabelValue(label, value, charWidth) + ESC_BOLD_OFF + '\n');
        } else {
          parts.push(formatLabelValue(label, value, charWidth) + '\n');
        }
      } else if (block.type === 'itemsTable' && Array.isArray(data.items)) {
        parts.push(''.padEnd(charWidth, '-') + '\n');
        const tableLines = formatItemsTable(data.items, block.columns ?? [], charWidth);
        parts.push(...tableLines.map(l => l + '\n'));
        parts.push(''.padEnd(charWidth, '-') + '\n');
      } else if (block.type === 'separator') {
        parts.push(''.padEnd(charWidth, '-') + '\n');
      } else if (block.type === 'line') {
        const text = sanitizeLine(block.text ?? '');
        if (text) parts.push(text + '\n');
      } else if (block.type === 'logo') {
        // FS p 1 0 prints NV bit image #1.
        // Only emit this if NV logo has been uploaded to the printer.
        // Sending it to a printer without NV data may cause the printer to halt.
        // We emit it as a comment-only; remove this guard once NV logo is loaded.
        // parts.push('\x1C\x70\x01\x00');
        parts.push(ESC_ALIGN_C + '*** RECEIPT ***\n' + ESC_ALIGN_L);
      }
    }
  };

  processBlocks(templateLayout.header);
  processBlocks(templateLayout.body);
  processBlocks(templateLayout.footer);

  // Feed 6 lines to push last content past the cutter head, then cut
  parts.push(FEED_BEFORE_CUT);
  parts.push(CUT_FULL);

  return parts.join('');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format label + value as a single padded line: "Label:        value" */
function formatLabelValue(label: string, value: string, charWidth: number): string {
  const prefix = label + ': ';
  const maxVal = charWidth - prefix.length;
  const v = value.slice(0, Math.max(maxVal, 1));
  return prefix + v;
}

/** Format a field value — dates, money, plain strings */
function formatFieldValue(key: string, value: unknown): string {
  if (value instanceof Date) return formatDate(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.replace('T', ' ').slice(0, 19);
  }
  if (MONEY_FIELDS.has(key) && typeof value === 'number') {
    return value.toFixed(2);
  }
  return sanitizeLine(String(value));
}

/**
 * Resolve a printable field name to a value from data.
 * Returns empty string for undefined/null.
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

/** Strip control chars and newlines that would break the ESC/POS stream */
function sanitizeLine(s: string): string {
  return s.replace(/[\r\n]/g, ' ').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '').slice(0, 256);
}

/**
 * Format items table.
 * Layout: qty × name — price
 * Sub-lines for size, special notes, modifiers.
 */
function formatItemsTable(
  items: Record<string, unknown>[],
  columns: string[],
  charWidth: number,
): string[] {
  const lines: string[] = [];

  for (const item of items) {
    // Primary line: "Qty x Name ........... Price"
    const qty      = String(item['quantity'] ?? '1');
    const name     = sanitizeLine(String(item['name']        ?? '')).slice(0, charWidth - 18);
    const price    = typeof item['lineSubtotal'] === 'number'
      ? item['lineSubtotal'].toFixed(2)
      : String(item['lineSubtotal'] ?? '');
    const unitP    = typeof item['unitPrice'] === 'number'
      ? item['unitPrice'].toFixed(2)
      : String(item['unitPrice'] ?? '');

    // "1x Burger              9.99"
    const left  = `${qty}x ${name}`;
    const right = price;
    const dots  = charWidth - left.length - right.length;
    lines.push(left + ' '.repeat(Math.max(1, dots)) + right);

    // Unit price if differs from lineSubtotal (i.e. qty > 1)
    if (Number(item['quantity']) > 1 && unitP) {
      lines.push(`   @ ${unitP} each`);
    }

    // Size
    const size = sanitizeLine(String(item['size'] ?? '')).trim();
    if (size) lines.push(`   Size: ${size}`);

    // Modifiers
    const mods = item.modifiers as
      | Array<{ name_snapshot?: string; quantity_label_snapshot?: string }>
      | undefined;
    if (Array.isArray(mods) && mods.length > 0) {
      for (const m of mods) {
        const label = [m.name_snapshot, m.quantity_label_snapshot].filter(Boolean).join(' ');
        if (label) lines.push('   + ' + sanitizeLine(label));
      }
    }

    // Special notes
    const notes = sanitizeLine(String(item['specialNotes'] ?? '')).trim();
    if (notes) lines.push(`   Note: ${notes}`);
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
  const items    = context?.itemsFilter ?? order.items;
  const delivery = order.delivery;

  const data: TemplateRenderData = {
    orderNumber:      order.order_number,
    orderType:        order.order_type,
    orderStatus:      order.status,
    serviceTimeType:  order.service_time_type,
    scheduleTime:     order.schedule_time   ? formatDate(order.schedule_time)   : '',
    readyTime:        order.ready_time      ? formatDate(order.ready_time)      : '',
    actualReadyTime:  order.actual_ready_time ? formatDate(order.actual_ready_time) : '',
    createdAt:        order.created_at instanceof Date
      ? formatDate(order.created_at)
      : String(order.created_at ?? ''),
    updatedAt:        order.updated_at instanceof Date
      ? formatDate(order.updated_at)
      : String(order.updated_at ?? ''),
    notes:            order.notes ?? '',
    paymentMethod:    order.money.payment,
    currency:         order.money.currency,
    subtotal:         order.money.subtotal,
    discount:         order.money.discount,
    deliveryFee:      order.money.delivery_fee,
    taxTotal:         order.money.tax_total,
    tips:             order.money.tips,
    totalAmount:      order.money.total_amount,
    name:             delivery?.name  ?? context?.customerName  ?? '',
    phone:            delivery?.phone ?? context?.customerPhone ?? '',
    email:            context?.customerEmail ?? '',
    address:          formatAddress(delivery?.address),
    branchName:       context?.branchName    ?? '',
    businessAddress:  formatAddress(context?.businessAddress),
    cashierName:      context?.cashierName   ?? '',
    items: items.map((item) => ({
      name:           item.name_snap,
      quantity:       item.quantity,
      size:           item.size_snap       ?? '',
      unitPrice:      item.unit_price,
      modifierTotals: item.modifier_totals,
      lineSubtotal:   item.line_subtotal,
      specialNotes:   item.special_notes   ?? '',
      kitchenSection: item.kitchen_section_snapshot ?? '',
      modifiers:      item.modifiers,
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
