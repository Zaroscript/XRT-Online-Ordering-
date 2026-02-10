import mongoose, { Schema, Document } from 'mongoose';
import {
  ModifierGroup,
  ModifierDisplayType,
  QuantityLevel,
  PricesBySize,
} from '../../../domain/entities/ModifierGroup';

export interface ModifierGroupDocument extends Omit<ModifierGroup, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const PricesBySizeSchema = new Schema(
  {
    sizeCode: {
      type: String,
      required: false,
    },
    size_id: {
      type: String,
      required: false,
    },
    priceDelta: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const QuantityLevelSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    display_order: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    prices_by_size: {
      type: [PricesBySizeSchema],
      default: [],
    },
  },
  { _id: false }
);

const ModifierGroupSchema = new Schema<ModifierGroupDocument>(
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
    display_name: {
      type: String,
      trim: true,
    },
    display_type: {
      type: String,
      required: true,
      enum: ['RADIO', 'CHECKBOX'],
      default: 'RADIO',
    },
    min_select: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    max_select: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    quantity_levels: {
      type: [QuantityLevelSchema],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Validation: max_select must be >= min_select
ModifierGroupSchema.pre('validate', function (next) {
  if (this.max_select < this.min_select) {
    next(new Error('max_select must be greater than or equal to min_select'));
  } else {
    next();
  }
});

// Validation: Only one quantity level can be default
ModifierGroupSchema.pre('validate', function (next) {
  if (this.quantity_levels && this.quantity_levels.length > 0) {
    const defaultCount = this.quantity_levels.filter((ql: QuantityLevel) => ql.is_default).length;
    if (defaultCount > 1) {
      next(new Error('Only one quantity level can be marked as default'));
    } else {
      next();
    }
  } else {
    next();
  }
});

ModifierGroupSchema.index({ business_id: 1, name: 1 }, { unique: true });
ModifierGroupSchema.index({ business_id: 1, is_active: 1 });
ModifierGroupSchema.index({ business_id: 1, deleted_at: 1 });

export const ModifierGroupModel = mongoose.model<ModifierGroupDocument>(
  'ModifierGroup',
  ModifierGroupSchema
);
