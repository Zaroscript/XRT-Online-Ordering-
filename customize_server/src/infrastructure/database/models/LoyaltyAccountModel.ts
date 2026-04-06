import mongoose, { Schema, Document } from 'mongoose';
import { LoyaltyAccount } from '../../../domain/entities/LoyaltyAccount';

export interface LoyaltyAccountDocument extends Omit<LoyaltyAccount, 'id' | 'customer_id'>, Document {
  _id: mongoose.Types.ObjectId;
  customer_id: mongoose.Types.ObjectId | string;
}

const LoyaltyAccountSchema = new Schema<LoyaltyAccountDocument>(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true,
      index: true,
    },
    points_balance: {
      type: Number,
      required: true,
      default: 0,
    },
    total_points_earned: {
      type: Number,
      required: true,
      default: 0,
    },
    total_points_redeemed: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const LoyaltyAccountModel = mongoose.model<LoyaltyAccountDocument>(
  'LoyaltyAccount',
  LoyaltyAccountSchema
);
