import mongoose, { Schema, Document } from 'mongoose';
import {
  PriceChangeHistory,
  PriceChangeType,
  PriceChangeStatus,
  PriceValueType,
} from '../../../domain/entities/PriceChangeHistory';

export interface PriceChangeHistoryDocument extends Omit<PriceChangeHistory, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const PriceChangeHistorySchema = new Schema<PriceChangeHistoryDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PriceChangeType),
      required: true,
    },
    value_type: {
      type: String,
      enum: Object.values(PriceValueType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    affected_items_count: {
      type: Number,
      required: true,
    },
    target: {
      type: String,
      enum: ['ITEMS', 'MODIFIERS'],
      default: 'ITEMS',
    },
    snapshot: {
      type: Schema.Types.Mixed, // Storing as Mixed to avoid TS array issues, but logic ensures it's an array
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(PriceChangeStatus),
      default: PriceChangeStatus.COMPLETED,
      required: true,
    },
    rolled_back_at: {
      type: Date,
    },
    rolled_back_by: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PriceChangeHistorySchema.index({ business_id: 1, created_at: -1 });

export const PriceChangeHistoryModel = mongoose.model<PriceChangeHistoryDocument>(
  'PriceChangeHistory',
  PriceChangeHistorySchema
);
