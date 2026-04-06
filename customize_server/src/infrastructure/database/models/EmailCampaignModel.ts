import mongoose, { Schema, Document } from 'mongoose';
import { EmailCampaign } from '../../../domain/entities/EmailCampaign';

export interface EmailCampaignDocument extends Omit<EmailCampaign, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const AudienceFilterSchema = new Schema(
  {
    rule: {
      value: { type: String },
      label: { type: String },
    },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const EmailCampaignSchema = new Schema<EmailCampaignDocument>(
  {
    heading: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    filters: { type: [AudienceFilterSchema], default: [] },
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

EmailCampaignSchema.index({ created_at: -1 });
EmailCampaignSchema.index({ status: 1 });

export const EmailCampaignModel = mongoose.model<EmailCampaignDocument>('EmailCampaign', EmailCampaignSchema);
