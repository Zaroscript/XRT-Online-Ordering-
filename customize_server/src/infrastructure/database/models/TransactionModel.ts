import mongoose, { Schema, Document, Types } from 'mongoose';
import { Transaction } from '../../../domain/entities/Transaction';

export interface TransactionDocument extends Omit<Transaction, 'id' | 'order_id' | 'customer_id'>, Document {
  _id: Types.ObjectId;
  order_id: Types.ObjectId;
  customer_id: Types.ObjectId;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    transaction_id: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    gateway: { type: String, enum: ['nmi', 'authorize_net'], required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'voided'],
      default: 'pending',
    },
    payment_method: { type: String, required: true },
    card_type: { type: String },
    last_4: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

TransactionSchema.index({ created_at: -1 });

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
