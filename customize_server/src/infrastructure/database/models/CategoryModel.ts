import mongoose, { Schema, Document } from 'mongoose';
import { Category } from '../../../domain/entities/Category';

export interface CategoryDocument extends Omit<Category, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    kitchen_section_id: {
      type: String,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    image: {
      type: String,
    },
    image_public_id: {
      type: String,
    },
    icon: {
      type: String,
    },
    icon_public_id: {
      type: String,
    },
    translated_languages: {
      type: [String],
      default: ['en'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

CategorySchema.index({ business_id: 1, name: 1 }, { unique: true });
CategorySchema.index({ business_id: 1, is_active: 1 });
CategorySchema.index({ business_id: 1, kitchen_section_id: 1 });

export const CategoryModel = mongoose.model<CategoryDocument>('Category', CategorySchema);

