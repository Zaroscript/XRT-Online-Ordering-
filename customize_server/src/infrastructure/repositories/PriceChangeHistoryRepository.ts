import {
  PriceChangeHistory,
  CreatePriceChangeHistoryDTO,
  PriceChangeStatus,
} from '../../domain/entities/PriceChangeHistory';
import { IPriceChangeHistoryRepository } from '../../domain/repositories/IPriceChangeHistoryRepository';
import {
  PriceChangeHistoryModel,
  PriceChangeHistoryDocument,
} from '../database/models/PriceChangeHistoryModel';

export class PriceChangeHistoryRepository implements IPriceChangeHistoryRepository {
  private toDomain(document: PriceChangeHistoryDocument): PriceChangeHistory {
    return {
      id: document._id.toString(),
      business_id: document.business_id,
      admin_id: (document.admin_id as any)?.name || document.admin_id, // Use name if populated, else ID
      type: document.type as any,
      value_type: document.value_type as any,
      value: document.value,
      affected_items_count: document.affected_items_count,
      snapshot: document.snapshot,
      status: document.status as any,
      created_at: document.created_at,
      updated_at: document.updated_at,
      rolled_back_at: document.rolled_back_at,
      rolled_back_by: document.rolled_back_by,
      target: document.target as any,
    };
  }

  async create(data: CreatePriceChangeHistoryDTO): Promise<PriceChangeHistory> {
    const historyDoc = new PriceChangeHistoryModel(data);
    await historyDoc.save();
    return this.toDomain(historyDoc);
  }

  async findById(id: string): Promise<PriceChangeHistory | null> {
    const historyDoc = await PriceChangeHistoryModel.findById(id).select('+snapshot');
    return historyDoc ? this.toDomain(historyDoc) : null;
  }

  async findAll(
    businessId: string | string[],
    page: number,
    limit: number
  ): Promise<{ history: PriceChangeHistory[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (Array.isArray(businessId)) {
      query.business_id = { $in: businessId };
    } else {
      // Create flexible query for business_id (string or possibly ObjectId if schema allowed mixed)
      // Since schema is String, we should just use the string.
      // But let's support array check just in case.
      query.business_id = businessId;
    }

    const [docs, total] = await Promise.all([
      PriceChangeHistoryModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('admin_id', 'name email'), // Populate user details
      PriceChangeHistoryModel.countDocuments(query),
    ]);

    return {
      history: docs.map((doc) => this.toDomain(doc)),
      total,
    };
  }

  async markAsRolledBack(id: string, rolledBackBy: string): Promise<void> {
    await PriceChangeHistoryModel.findByIdAndUpdate(id, {
      status: PriceChangeStatus.ROLLED_BACK,
      rolled_back_at: new Date(),
      rolled_back_by: rolledBackBy,
    });
  }

  async markAsFailed(id: string): Promise<void> {
    await PriceChangeHistoryModel.findByIdAndUpdate(id, {
      status: PriceChangeStatus.FAILED,
    });
  }

  async delete(id: string): Promise<void> {
    await PriceChangeHistoryModel.findByIdAndDelete(id);
  }

  async deleteAll(businessId: string): Promise<void> {
    await PriceChangeHistoryModel.deleteMany({ business_id: businessId });
  }
}
