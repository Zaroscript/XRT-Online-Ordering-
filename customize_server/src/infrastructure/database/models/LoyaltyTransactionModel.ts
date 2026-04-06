import mongoose, { Schema, Document } from 'mongoose';
import { LoyaltyTransaction } from '../../../domain/entities/LoyaltyTransaction';

export interface LoyaltyTransactionDocument extends Omit<LoyaltyTransaction, 'id' | 'loyalty_account_id' | 'order_id'>, Document {
  _id: mongoose.Types.ObjectId;
  loyalty_account_id: mongoose.Types.ObjectId | string;
  order_id?: mongoose.Types.ObjectId | string;
}

const LoyaltyTransactionSchema = new Schema<LoyaltyTransactionDocument>(
  {
    loyalty_account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoyaltyAccount',
      required: true,
      index: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    type: {
      type: String,
      enum: ['EARN', 'REDEEM', 'ADJUST'],
      required: true,
    },
    points_change: {
      type: Number,
      required: true,
    },
    points_balance_after: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }, // Only need created_at
  }
);

export const LoyaltyTransactionModel = mongoose.model<LoyaltyTransactionDocument>(
  'LoyaltyTransaction',
  LoyaltyTransactionSchema
);
