import mongoose, { Schema, Document } from 'mongoose';
import { LoyaltyProgram } from '../../../domain/entities/LoyaltyProgram';

export interface LoyaltyProgramDocument extends Omit<LoyaltyProgram, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const LoyaltyProgramSchema = new Schema<LoyaltyProgramDocument>(
  {
    is_active: {
      type: Boolean,
      default: false,
    },
    earn_rate_points_per_currency: {
      type: Number,
      required: true,
      default: 1,
    },
    redeem_rate_currency_per_point: {
      type: Number,
      required: true,
      default: 0.05,
    },
    minimum_points_to_redeem: {
      type: Number,
      required: true,
      default: 50,
    },
    max_discount_percent_per_order: {
      type: Number,
      required: true,
      default: 50,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const LoyaltyProgramModel = mongoose.model<LoyaltyProgramDocument>(
  'LoyaltyProgram',
  LoyaltyProgramSchema
);
