import { IPrinterRepository } from '../../domain/repositories/IPrinterRepository';
import {
  Printer,
  CreatePrinterDTO,
  UpdatePrinterDTO,
  PrinterFilters,
} from '../../domain/entities/Printer';
import { PrinterModel, PrinterDocument } from '../database/models/PrinterModel';
import { Types } from 'mongoose';

export class PrinterRepository implements IPrinterRepository {
  private toDomain(doc: PrinterDocument): Printer {
    return {
      id: doc._id?.toString() || '',
      name: doc.name,
      connection_type: doc.connection_type as Printer['connection_type'],
      interface: doc.interface,
      assigned_template_ids: doc.assigned_template_ids
        ? doc.assigned_template_ids.map((id) => id?.toString() || '')
        : [],
      kitchen_sections: doc.kitchen_sections || [],
      printnode_printer_id: (doc as any).printnode_printer_id ?? null,
      active: doc.active,
      autoPrint: (doc as any).autoPrint ?? false,
      maxRetries: (doc as any).maxRetries ?? 3,
      last_status: doc.last_status ?? null,
      last_printed_at: doc.last_printed_at ?? null,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async create(data: CreatePrinterDTO): Promise<Printer> {
    const doc = await PrinterModel.create(data);
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<Printer | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrinterModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(filters: PrinterFilters): Promise<Printer[]> {
    const query: Record<string, unknown> = {};
    if (filters.active != null) query.active = filters.active;
    if (filters.kitchen_section != null) {
      query.kitchen_sections = filters.kitchen_section;
    }
    const docs = await PrinterModel.find(query).sort({ name: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async update(id: string, data: UpdatePrinterDTO): Promise<Printer | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrinterModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await PrinterModel.findByIdAndDelete(id).exec();
    return result != null;
  }
}
