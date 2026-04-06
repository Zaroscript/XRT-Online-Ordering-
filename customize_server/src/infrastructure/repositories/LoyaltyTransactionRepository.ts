import { ILoyaltyTransactionRepository } from '../../domain/repositories/ILoyaltyTransactionRepository';
import { LoyaltyTransaction } from '../../domain/entities/LoyaltyTransaction';
import { LoyaltyTransactionModel } from '../database/models/LoyaltyTransactionModel';
import { Types } from 'mongoose';

export class LoyaltyTransactionRepository implements ILoyaltyTransactionRepository {
  private toEntity(doc: any): LoyaltyTransaction {
    return {
      id: doc._id.toString(),
      loyalty_account_id: doc.loyalty_account_id.toString(),
      order_id: doc.order_id?.toString(),
      type: doc.type,
      points_change: doc.points_change,
      points_balance_after: doc.points_balance_after,
      description: doc.description,
      created_at: doc.created_at,
    };
  }

  async create(data: Omit<LoyaltyTransaction, 'id' | 'created_at'>): Promise<LoyaltyTransaction> {
    const doc = await LoyaltyTransactionModel.create({
      loyalty_account_id: new Types.ObjectId(data.loyalty_account_id),
      order_id: data.order_id ? new Types.ObjectId(data.order_id) : undefined,
      type: data.type,
      points_change: data.points_change,
      points_balance_after: data.points_balance_after,
      description: data.description,
    });
    return this.toEntity(doc);
  }

  async listByAccount(
    loyalty_account_id: string,
    pagination: { page: number; limit: number }
  ): Promise<{ data: LoyaltyTransaction[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query = { loyalty_account_id: new Types.ObjectId(loyalty_account_id) };

    const [docs, total] = await Promise.all([
      LoyaltyTransactionModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LoyaltyTransactionModel.countDocuments(query),
    ]);

    return {
      data: docs.map(doc => this.toEntity(doc)),
      total,
    };
  }

  async findByOrderIdAndType(order_id: string, type: 'EARN' | 'REDEEM' | 'REFUND' | 'CLAWBACK'): Promise<LoyaltyTransaction | null> {
    if (!Types.ObjectId.isValid(order_id)) return null;
    const doc = await LoyaltyTransactionModel.findOne({
      order_id: new Types.ObjectId(order_id),
      type,
    }).lean();
    return doc ? this.toEntity(doc) : null;
  }
}
