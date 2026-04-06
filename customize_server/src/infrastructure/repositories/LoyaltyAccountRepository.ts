import { ILoyaltyAccountRepository } from '../../domain/repositories/ILoyaltyAccountRepository';
import { LoyaltyAccount } from '../../domain/entities/LoyaltyAccount';
import { LoyaltyAccountModel } from '../database/models/LoyaltyAccountModel';
import { CustomerModel } from '../database/models/CustomerModel';
import { Types } from 'mongoose';

export class LoyaltyAccountRepository implements ILoyaltyAccountRepository {
  private toEntity(doc: any): LoyaltyAccount {
    const entity: LoyaltyAccount = {
      id: doc._id.toString(),
      customer_id: doc.customer_id._id ? doc.customer_id._id.toString() : doc.customer_id.toString(),
      points_balance: doc.points_balance,
      total_points_earned: doc.total_points_earned,
      total_points_redeemed: doc.total_points_redeemed,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };

    // If customer_id was populated
    if (doc.customer_id && typeof doc.customer_id === 'object' && doc.customer_id.name) {
      entity.customer = {
        name: doc.customer_id.name,
        email: doc.customer_id.email,
        phoneNumber: doc.customer_id.phoneNumber,
      };
    }

    return entity;
  }

  async findByCustomerId(customer_id: string): Promise<LoyaltyAccount | null> {
    const doc = await LoyaltyAccountModel.findOne({ customer_id: new Types.ObjectId(customer_id) }).populate('customer_id');
    return doc ? this.toEntity(doc) : null;
  }

  async findById(id: string): Promise<LoyaltyAccount | null> {
    const doc = await LoyaltyAccountModel.findById(id).populate('customer_id');
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByPhone(phone: string): Promise<LoyaltyAccount | null> {
    const customer = await CustomerModel.findOne({ phoneNumber: phone });
    if (!customer) return null;
    return this.findByCustomerId(customer._id.toString());
  }

  async upsertForCustomer(customer_id: string): Promise<LoyaltyAccount> {
    const doc = await LoyaltyAccountModel.findOneAndUpdate(
      { customer_id: new Types.ObjectId(customer_id) },
      { $setOnInsert: { points_balance: 0, total_points_earned: 0, total_points_redeemed: 0 } },
      { new: true, upsert: true }
    );
    return this.toEntity(doc);
  }

  async updateBalance(
    id: string,
    delta: number,
    totalsUpdate: { earned?: number; redeemed?: number }
  ): Promise<LoyaltyAccount> {
    const inc: any = { points_balance: delta };
    if (totalsUpdate.earned) inc.total_points_earned = totalsUpdate.earned;
    if (totalsUpdate.redeemed) inc.total_points_redeemed = totalsUpdate.redeemed;

    const doc = await LoyaltyAccountModel.findByIdAndUpdate(
      id,
      { $inc: inc },
      { new: true }
    );
    if (!doc) throw new Error('Loyalty account not found');
    return this.toEntity(doc);
  }

  async list(pagination: { page: number; limit: number; search?: string }): Promise<{ data: any[]; total: number }> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'customer.name': { $regex: search, $options: 'i' } },
            { 'customer.phoneNumber': { $regex: search, $options: 'i' } },
            { 'customer.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { created_at: -1 } });
    
    // Count total pipeline
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await LoyaltyAccountModel.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Data pipeline
    pipeline.push({ $skip: skip }, { $limit: limit });
    const docs = await LoyaltyAccountModel.aggregate(pipeline);

    const data = docs.map((doc) => ({
      id: doc._id.toString(),
      customer_id: doc.customer_id.toString(),
      customer: {
        name: doc.customer.name,
        email: doc.customer.email,
        phoneNumber: doc.customer.phoneNumber,
      },
      points_balance: doc.points_balance,
      total_points_earned: doc.total_points_earned,
      total_points_redeemed: doc.total_points_redeemed,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));

    return { data, total };
  }
}
