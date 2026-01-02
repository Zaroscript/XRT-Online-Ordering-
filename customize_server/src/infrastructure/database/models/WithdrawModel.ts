import mongoose, { Schema, Document } from 'mongoose';
import { Withdraw, WithdrawStatus } from '../../../domain/entities/Withdraw';

export interface WithdrawDocument extends Omit<Withdraw, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const WithdrawSchema = new Schema<WithdrawDocument>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    status: {
      type: String,
      enum: Object.values(WithdrawStatus),
      default: WithdrawStatus.PENDING,
      index: true,
    },
    business_id: {
      type: Schema.Types.ObjectId as any,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    payment_method: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    details: {
      type: String,
    },
    note: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
WithdrawSchema.index({ business_id: 1, status: 1 });
WithdrawSchema.index({ createdBy: 1 });
WithdrawSchema.index({ status: 1 });

export const WithdrawModel = mongoose.model<WithdrawDocument>('Withdraw', WithdrawSchema);

