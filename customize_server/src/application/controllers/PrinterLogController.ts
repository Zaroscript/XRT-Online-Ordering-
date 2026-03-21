import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PrinterLogRepository } from '../../infrastructure/repositories/PrinterLogRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { Types } from 'mongoose';

const repo = new PrinterLogRepository();

function parsePagination(query: Record<string, unknown>): { limit: number; skip: number } {
  const limitRaw = parseInt(String(query.limit ?? '50'), 10);
  const pageRaw = parseInt(String(query.page ?? '1'), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
  const skip = (page - 1) * limit;
  return { limit, skip };
}

export class PrinterLogController {
  /** GET /printer-logs — all logs (optional filters) */
  listAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const filters = {
      printer_id: req.query.printer_id ? String(req.query.printer_id) : undefined,
      event_type: req.query.event_type ? String(req.query.event_type) : undefined,
      level: req.query.level ? String(req.query.level) : undefined,
    };

    const [items, total] = await Promise.all([
      repo.findMany(filters, { limit, skip }),
      repo.count(filters),
    ]);

    return sendSuccess(res, 'Printer logs retrieved', {
      items,
      total,
      limit,
      skip,
      page: skip / limit + 1,
    });
  });

  /** GET /printers/:id/logs — logs for one printer */
  listByPrinterId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { limit, skip } = parsePagination(req.query as Record<string, unknown>);
    if (!Types.ObjectId.isValid(id)) {
      return sendSuccess(res, 'Printer logs retrieved', {
        items: [],
        total: 0,
        limit,
        skip: 0,
        page: 1,
      });
    }
    const filters = { printer_id: id };

    const [items, total] = await Promise.all([
      repo.findMany(filters, { limit, skip }),
      repo.count(filters),
    ]);

    return sendSuccess(res, 'Printer logs retrieved', {
      items,
      total,
      limit,
      skip,
      page: skip / limit + 1,
    });
  });
}
