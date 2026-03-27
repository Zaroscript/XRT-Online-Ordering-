import { PrinterLogRepository } from '../../infrastructure/repositories/PrinterLogRepository';
import { CreatePrinterLogDTO } from '../../domain/entities/PrinterLog';
import { logger } from '../../shared/utils/logger';

const repo = new PrinterLogRepository();

/** Persist a printer activity row; never throws (logging must not break printing). */
export async function recordPrinterLog(input: CreatePrinterLogDTO): Promise<void> {
  try {
    await repo.create(input);
  } catch (err) {
    logger.error('[recordPrinterLog] Failed to save printer log:', err);
  }
}
