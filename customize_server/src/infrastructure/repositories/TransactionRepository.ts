import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, CreateTransactionDTO } from '../../domain/entities/Transaction';
import { TransactionModel, TransactionDocument } from '../database/models/TransactionModel';
import { Types } from 'mongoose';

export class TransactionRepository implements ITransactionRepository {
  private mapToDomain(doc: TransactionDocument): Transaction {
    const obj = doc.toObject();
    
    // Ensure nested objects preserve their properties even if not fully populated
    let order_id = obj.order_id;
    if (typeof order_id === 'object' && order_id !== null) {
      order_id = { ...order_id, id: order_id._id?.toString() || order_id.id };
    } else {
      order_id = order_id?.toString() || '';
    }

    let customer_id = obj.customer_id;
    if (typeof customer_id === 'object' && customer_id !== null) {
      customer_id = { ...customer_id, id: customer_id._id?.toString() || customer_id.id };
    } else {
      customer_id = customer_id?.toString() || '';
    }

    return {
      ...obj,
      id: obj._id?.toString() || '',
      order_id,
      customer_id
    };
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const doc = new TransactionModel(data);
    const saved = await doc.save();
    return this.mapToDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await TransactionModel.findById(id).populate('order_id').populate('customer_id').exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Transaction[]> {
    if (!Types.ObjectId.isValid(orderId)) return [];
    const docs = await TransactionModel.find({ order_id: orderId }).populate('order_id').populate('customer_id').exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async findByTransactionId(transactionId: string): Promise<Transaction | null> {
    const doc = await TransactionModel.findOne({ transaction_id: transactionId }).populate('order_id').populate('customer_id').exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findAll(filters: any): Promise<{ data: Transaction[]; total: number }> {
    const query: any = {};
    
    if (filters.customer_id) query.customer_id = filters.customer_id;
    if (filters.order_id && Types.ObjectId.isValid(filters.order_id)) {
      query.order_id = new Types.ObjectId(filters.order_id);
    }
    if (filters.status) query.status = filters.status;
    if (filters.gateway) query.gateway = filters.gateway;
    
    // Date filtering
    if (filters.startDate || filters.endDate) {
      query.created_at = {};
      if (filters.startDate) query.created_at.$gte = new Date(filters.startDate);
      if (filters.endDate) query.created_at.$lte = new Date(filters.endDate);
    } else if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query.created_at = { $gte: start, $lte: end };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Use aggregation to filter by joined order status
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order_details',
        },
      },
      { $unwind: '$order_details' },
      { $match: { 'order_details.status': { $in: ['completed', 'canceled', 'cancelled'] } } },
      { $sort: { created_at: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const results = await TransactionModel.aggregate(pipeline).exec();
    const data = results[0]?.data || [];
    const total = results[0]?.metadata[0]?.total || 0;

    // Now populate the full documents for the returned data to maintain compatibility with mapToDomain
    // (A bit inefficient but safe for the current architecture)
    const populatedDocs = await TransactionModel.find({
      _id: { $in: data.map((d: any) => d._id) }
    }).populate('order_id').populate('customer_id').sort({ created_at: -1 }).exec();

    return {
      data: populatedDocs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await TransactionModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
