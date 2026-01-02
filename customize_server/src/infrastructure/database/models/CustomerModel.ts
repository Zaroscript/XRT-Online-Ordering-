import mongoose, { Schema, Document } from 'mongoose';
import { Customer } from '../../../domain/entities/Customer';

export interface CustomerDocument extends Omit<Customer, 'id' | 'business_id'>, Document {
  _id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId | string;
}

const CustomerSchema = new Schema<CustomerDocument>(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Please provide a business ID'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    rewards: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    last_order_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
CustomerSchema.index({ business_id: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ business_id: 1, email: 1 });

export const CustomerModel = mongoose.model<CustomerDocument>('Customer', CustomerSchema);

