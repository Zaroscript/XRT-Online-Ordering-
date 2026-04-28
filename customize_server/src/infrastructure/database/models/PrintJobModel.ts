import mongoose, { Schema, Document, Types } from 'mongoose';
import { PrintJob, PrintJobStatus, RenderedTemplate } from '../../../domain/entities/PrintJob';

export interface PrintJobDocument extends Omit<PrintJob, 'id' | 'orderId' | 'printerId'>, Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId | string;
  printerId: Types.ObjectId | string;
}

const RenderedTemplateSchema = new Schema<RenderedTemplate>(
  {
    templateId: { type: String, required: true },
    renderedContent: { type: String, required: true }, // Base64 ESC/POS string
    autoCut: { type: Boolean, default: true },
  },
  { _id: false }
);

const PrintJobSchema = new Schema<PrintJobDocument>(
  {
    orderId: { type: String, required: true, index: true },
    printerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'printing', 'printed', 'sent', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    retryCount: { type: Number, default: 0, required: true },
    maxRetries: { type: Number, default: 3, required: true },
    renderedTemplates: { type: [RenderedTemplateSchema], required: true },
    errorMessage: { type: String, default: null },
    sentAt: { type: Date, default: null, index: true },
    lockedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for the local agent to efficiently poll pending jobs by printer
PrintJobSchema.index({ printerId: 1, status: 1 });

export const PrintJobModel = mongoose.model<PrintJobDocument>('PrintJob', PrintJobSchema);
