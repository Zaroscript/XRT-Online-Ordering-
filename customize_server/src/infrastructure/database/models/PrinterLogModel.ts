import mongoose, { Schema, Document, Types } from 'mongoose';
import { PrinterLog, PrinterLogLevel } from '../../../domain/entities/PrinterLog';

export interface PrinterLogDocument
  extends Omit<PrinterLog, 'id' | 'created_at' | 'metadata'>,
    Document {
  _id: Types.ObjectId;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

const PrinterLogSchema = new Schema<PrinterLogDocument>(
  {
    printer_id: { type: String, required: true, index: true },
    printer_name: { type: String, default: null },
    event_type: { type: String, required: true, index: true },
    level: {
      type: String,
      enum: ['info', 'success', 'warn', 'error'] as PrinterLogLevel[],
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    order_id: { type: String, default: null, index: true },
    order_number: { type: String, default: null },
    print_job_id: { type: String, default: null },
    error: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

PrinterLogSchema.index({ printer_id: 1, created_at: -1 });
PrinterLogSchema.index({ created_at: -1 });

export const PrinterLogModel = mongoose.model<PrinterLogDocument>(
  'PrinterLog',
  PrinterLogSchema
);
