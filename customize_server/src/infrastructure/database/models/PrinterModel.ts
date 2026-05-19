import mongoose, { Schema, Document, Types } from 'mongoose';
import { Printer } from '../../../domain/entities/Printer';

export interface PrinterDocument extends Omit<Printer, 'id' | 'assigned_template_ids'>, Document {
  _id: Types.ObjectId;
  assigned_template_ids: Types.ObjectId[];
}

const PrinterSchema = new Schema<PrinterDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    connection_type: {
      type: String,
      enum: ['lan', 'wifi', 'bluetooth', 'network', 'usb', 'printnode'],
      required: true,
    },
    interface: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    printnode_printer_id: {
      type: Number,
      default: null,
    },
    assigned_template_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'PrintTemplate',
      default: [],
    },
    kitchen_sections: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    port: {
      type: Number,
      default: 9100,
    },
    usbPort: {
      type: String,
    },
    autoPrint: {
      type: Boolean,
      default: true,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    last_status: {
      type: String,
      default: null,
    },
    last_printed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PrinterSchema.index({ active: 1 });
PrinterSchema.index({ kitchen_sections: 1 });

export const PrinterModel = mongoose.model<PrinterDocument>('Printer', PrinterSchema);
