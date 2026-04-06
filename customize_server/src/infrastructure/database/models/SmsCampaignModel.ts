import mongoose, { Schema, Document } from 'mongoose';
import { SmsCampaign } from '../../../domain/entities/SmsCampaign';

export interface SmsCampaignDocument extends Omit<SmsCampaign, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const SmsAudienceFilterSchema = new Schema(
  {
    rule: {
      value: { type: String },
      label: { type: String },
    },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const SmsCampaignSchema = new Schema<SmsCampaignDocument>(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    filters: { type: [SmsAudienceFilterSchema], default: [] },
    marketing_consent_only: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    recipient_count: { type: Number, default: 0 },
    sent_at: { type: String, default: null },
    error_message: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SmsCampaignSchema.index({ created_at: -1 });
SmsCampaignSchema.index({ status: 1 });

export const SmsCampaignModel = mongoose.model<SmsCampaignDocument>('SmsCampaign', SmsCampaignSchema);
