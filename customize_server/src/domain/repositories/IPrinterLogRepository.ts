import {
  PrinterLog,
  CreatePrinterLogDTO,
  PrinterLogQueryFilters,
} from '../entities/PrinterLog';

export interface IPrinterLogRepository {
  create(data: CreatePrinterLogDTO): Promise<PrinterLog>;
  findMany(
    filters: PrinterLogQueryFilters,
    options: { limit?: number; skip?: number }
  ): Promise<PrinterLog[]>;
  count(filters: PrinterLogQueryFilters): Promise<number>;
}
