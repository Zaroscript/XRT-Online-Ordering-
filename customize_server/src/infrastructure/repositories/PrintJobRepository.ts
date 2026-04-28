import {
  PrintJob,
  PrintJobStatus,
  CreatePrintJobDTO,
  UpdatePrintJobDTO,
} from '../../domain/entities/PrintJob';
import { PrintJobModel } from '../database/models/PrintJobModel';
import { Types } from 'mongoose';
import { logger } from '../../shared/utils/logger';

export class PrintJobRepository {
  /** Map Mongoose document to Domain Entity */
  private toDomain(doc: any): PrintJob {
    return {
      id: doc._id?.toString() || '',
      orderId: doc.orderId?.toString() || '',
      printerId: doc.printerId?.toString() || '',
      status: doc.status as PrintJobStatus,
      retryCount: doc.retryCount,
      maxRetries: doc.maxRetries,
      renderedTemplates: doc.renderedTemplates.map((rt: any) => ({
        templateId: rt.templateId,
        renderedContent: rt.renderedContent,
        autoCut: rt.autoCut,
      })),
      errorMessage: doc.errorMessage,
      sentAt: doc.sentAt ?? null,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      lockedAt: doc.lockedAt,
    };
  }

  async create(data: CreatePrintJobDTO): Promise<PrintJob> {
    const doc = new PrintJobModel({
      orderId: data.orderId,
      printerId: data.printerId,
      maxRetries: data.maxRetries ?? 3,
      renderedTemplates: data.renderedTemplates,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<PrintJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrintJobModel.findById(id).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, updates: UpdatePrintJobDTO): Promise<PrintJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrintJobModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await PrintJobModel.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Used by the local agent endpoint to fetch all pending/failed-but-retriable
   * jobs for a specific printer, claiming them atomically.
   */
  async claimNextJobsForPrinter(printerId: string, limit: number = 10): Promise<PrintJob[]> {
    const now = new Date();
    // Claim timeout: if a job was locked more than 2 minutes ago and is still 'printing', release it.
    const lockTimeout = new Date(now.getTime() - 2 * 60000);

    // Find jobs that are either 'pending', OR ('printing' but lock expired)
    const query = {
      printerId,
      $or: [{ status: 'pending' }, { status: 'printing', lockedAt: { $lt: lockTimeout } }],
    };

    // We can't updateMany and return docs atomically easily,
    // so we find them first, then atomically lock the specific IDs.
    const candidates = await PrintJobModel.find(query).sort({ created_at: 1 }).limit(limit).lean();

    if (candidates.length === 0) return [];

    const candidateIds = candidates.map((c) => c._id);

    // Atomically claim these specific jobs
    await PrintJobModel.updateMany(
      { _id: { $in: candidateIds }, ...query }, // Re-verify query conditions just in case
      {
        $set: {
          status: 'printing',
          lockedAt: now,
        },
      }
    );

    // Fetch the updated, locked docs to return
    const claimedDocs = await PrintJobModel.find({ _id: { $in: candidateIds } }).lean();
    return claimedDocs.map((doc) => this.toDomain(doc));
  }

  async findByOrderId(orderId: string): Promise<PrintJob[]> {
    const docs = await PrintJobModel.find({ orderId }).lean();
    return docs.map((doc) => this.toDomain(doc));
  }
}
