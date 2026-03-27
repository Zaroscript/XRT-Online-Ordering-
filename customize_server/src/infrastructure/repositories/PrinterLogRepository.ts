import { IPrinterLogRepository } from '../../domain/repositories/IPrinterLogRepository';
import {
  PrinterLog,
  CreatePrinterLogDTO,
  PrinterLogQueryFilters,
} from '../../domain/entities/PrinterLog';
import { PrinterLogModel, PrinterLogDocument } from '../database/models/PrinterLogModel';

export class PrinterLogRepository implements IPrinterLogRepository {
  private toDomain(doc: PrinterLogDocument): PrinterLog {
    const meta = doc.metadata;
    return {
      id: doc._id.toString(),
      printer_id: doc.printer_id,
      printer_name: doc.printer_name ?? null,
      event_type: doc.event_type as PrinterLog['event_type'],
      level: doc.level as PrinterLog['level'],
      message: doc.message,
      order_id: doc.order_id ?? null,
      order_number: doc.order_number ?? null,
      print_job_id: doc.print_job_id ?? null,
      error: doc.error ?? null,
      metadata:
        meta && typeof meta === 'object' && !Array.isArray(meta)
          ? (meta as Record<string, unknown>)
          : null,
      created_at: doc.created_at,
    };
  }

  async create(data: CreatePrinterLogDTO): Promise<PrinterLog> {
    const doc = await PrinterLogModel.create({
      printer_id: data.printer_id,
      printer_name: data.printer_name ?? null,
      event_type: data.event_type,
      level: data.level,
      message: data.message,
      order_id: data.order_id ?? null,
      order_number: data.order_number ?? null,
      print_job_id: data.print_job_id ?? null,
      error: data.error ?? null,
      metadata: data.metadata ?? null,
    });
    return this.toDomain(doc);
  }

  async findMany(
    filters: PrinterLogQueryFilters,
    options: { limit?: number; skip?: number } = {}
  ): Promise<PrinterLog[]> {
    const query: Record<string, unknown> = {};
    if (filters.printer_id) query.printer_id = filters.printer_id;
    if (filters.event_type) query.event_type = filters.event_type;
    if (filters.level) query.level = filters.level;

    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
    const skip = Math.max(options.skip ?? 0, 0);

    const docs = await PrinterLogModel.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return docs.map((d) => this.toDomain(d));
  }

  async count(filters: PrinterLogQueryFilters): Promise<number> {
    const query: Record<string, unknown> = {};
    if (filters.printer_id) query.printer_id = filters.printer_id;
    if (filters.event_type) query.event_type = filters.event_type;
    if (filters.level) query.level = filters.level;
    return PrinterLogModel.countDocuments(query).exec();
  }
}
