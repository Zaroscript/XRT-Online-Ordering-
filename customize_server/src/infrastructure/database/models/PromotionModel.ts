import mongoose, { Schema, Document } from 'mongoose';
import type { PromotionTemplateId } from '../../../shared/constants/promotions';
import { PROMOTION_TEMPLATES } from '../../../shared/constants/promotions';

export interface PromotionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  template: PromotionTemplateId;
  headline: string;
  description?: string;
  image_url?: string;
  rules: Record<string, unknown>;
  active_from: string;
  expire_at: string;
  /** Empty array = every weekday */
  active_weekdays?: number[];
  minimum_cart_amount: number;
  max_conversions: number | null;
  is_active_on_website: boolean;
  sort_order: number;
  /** Storefront card button label (e.g. Redeem) */
  cta_label?: string;
  orders: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const PromotionSchema = new Schema<PromotionDocument>(
  {
    business_id: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    template: {
      type: String,
      required: true,
      enum: [...PROMOTION_TEMPLATES],
    },
    headline: { type: String, required: true, maxlength: 35 },
    description: { type: String, maxlength: 100 },
    image_url: { type: String },
    rules: { type: Schema.Types.Mixed, default: {} },
    active_from: { type: String, required: true },
    expire_at: { type: String, required: true },
    active_weekdays: {
      type: [Number],
      default: [],
      validate: {
        validator(arr: number[]) {
          if (!Array.isArray(arr)) return false;
          return arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 6);
        },
        message: 'active_weekdays must be integers 0–6 (Sun–Sat)',
      },
    },
    minimum_cart_amount: { type: Number, default: 0 },
    max_conversions: { type: Number, default: null },
    is_active_on_website: { type: Boolean, default: false, index: true },
    sort_order: { type: Number, default: 0 },
    cta_label: { type: String, maxlength: 24, default: 'Redeem' },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PromotionSchema.index({ business_id: 1, is_active_on_website: 1 });

export const PromotionModel = mongoose.model<PromotionDocument>('Promotion', PromotionSchema);
