import mongoose, { Schema, Document } from 'mongoose';
import { Coupon } from '../../../domain/entities/Coupon';

export interface CouponDocument extends Omit<Coupon, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  max_conversions?: number | null;
}

const CouponSchema = new Schema<CouponDocument>(
  {
    code: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true, enum: ['fixed', 'percentage', 'free_shipping'] },
    amount: { type: Number, required: true },
    active_from: { type: String, required: true },
    expire_at: { type: String, required: true },
    target: { type: Boolean, default: false },
    shop_id: { type: String },
    is_approve: { type: Boolean, default: true },
    minimum_cart_amount: { type: Number, default: 0 },
    translated_languages: [{ type: String }],
    language: { type: String, default: 'en' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    max_conversions: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Ensure code is unique per shop? Or globally? Usually per shop or globally unique.
// Let's index code for faster lookups.
CouponSchema.index({ code: 1 });

export const CouponModel = mongoose.model<CouponDocument>('Coupon', CouponSchema);
