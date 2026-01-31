import mongoose, { Schema, Document } from 'mongoose';
import { Modifier } from '../../../domain/entities/Modifier';
import { QuantityLevel, PricesBySize } from '../../../domain/entities/ModifierGroup';

export interface ModifierDocument extends Omit<Modifier, 'id' | 'modifier_group_id'>, Document {
  _id: mongoose.Types.ObjectId;
  modifier_group_id: mongoose.Types.ObjectId | string;
}

const PricesBySizeSchema = new Schema(
  {
    size_id: {
      type: Schema.Types.ObjectId,
      ref: 'ItemSize',
      required: true,
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

const ModifierSchema = new Schema<ModifierDocument>(
  {
    modifier_group_id: {
      type: Schema.Types.ObjectId,
      ref: 'ModifierGroup',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    display_order: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sides_config: {
      enabled: {
        type: Boolean,
        default: false,
      },
      allowed_sides: {
        type: [String],
        enum: ['LEFT', 'RIGHT', 'WHOLE'],
        default: [],
      },
    },
    // Modifier-level configuration (overrides group defaults)
    quantity_levels: {
      type: [QuantityLevelSchema],
      default: [],
    },
    prices_by_size: {
      type: [PricesBySizeSchema],
      default: [],
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

// Note: Default modifier validation is handled in the repository/use case layer
// to avoid circular dependencies in Mongoose pre-hooks

ModifierSchema.index({ modifier_group_id: 1, name: 1 }, { unique: true });
ModifierSchema.index({ modifier_group_id: 1, is_active: 1 });
ModifierSchema.index({ modifier_group_id: 1, deleted_at: 1 });

export const ModifierModel = mongoose.model<ModifierDocument>('Modifier', ModifierSchema);
