import mongoose, { Schema, Document } from 'mongoose';
import { Business } from '../../../domain/entities/Business';

export interface BusinessDocument extends Omit<Business, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const BusinessSchema = new Schema<BusinessDocument>(
  {
    id: {
      type: String,
      required: [true, 'Please provide a business ID'],
      unique: true,
      trim: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'Please provide the business owner'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a business name'],
      maxlength: [100, 'Business name cannot be more than 100 characters'],
      trim: true,
    },
    legal_name: {
      type: String,
      required: [true, 'Please provide a legal business name'],
      maxlength: [100, 'Legal name cannot be more than 100 characters'],
      trim: true,
    },
    primary_content_name: {
      type: String,
      required: [true, 'Please provide a primary contact name'],
      maxlength: [100, 'Contact name cannot be more than 100 characters'],
      trim: true,
    },
    primary_content_email: {
      type: String,
      required: [true, 'Please provide a primary contact email'],
      lowercase: true,
      trim: true,
    },
    primary_content_phone: {
      type: String,
      required: [true, 'Please provide a primary contact phone'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    logo: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    google_maps_verification: {
      type: Boolean,
      default: false,
    },
    social_media: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      tiktok: { type: String, trim: true },
    },
    header_info: {
      type: String,
      trim: true,
    },

    messages: {
      closed_message: { type: String, trim: true },
      not_accepting_orders_message: { type: String, trim: true },
    },
    timezone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ id: 1 });

// Filter out inactive businesses by default
BusinessSchema.pre(/^find/, function (next) {
  (this as any).find({ isActive: { $ne: false } });
  next();
});

export const BusinessModel = mongoose.model<BusinessDocument>('Business', BusinessSchema);
