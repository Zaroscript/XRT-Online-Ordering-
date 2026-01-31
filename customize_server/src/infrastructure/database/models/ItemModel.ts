import mongoose, { Schema, Document } from 'mongoose';
import { Item } from '../../../domain/entities/Item';

export interface ItemDocument
  extends Omit<Item, 'id' | 'category_id' | 'default_size_id'>,
    Document {
  _id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId | string;
  default_size_id?: mongoose.Types.ObjectId | null;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
    sizes: {
      type: [
        {
          size_id: { type: Schema.Types.ObjectId, ref: 'ItemSize', required: true },
          price: { type: Number, required: true, min: 0 },
          is_default: { type: Boolean, default: false },
          is_active: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    image: {
      type: String,
    },
    image_public_id: {
      type: String,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    is_signature: {
      type: Boolean,
      default: false,
    },
    max_per_order: {
      type: Number,
    },
    is_sizeable: {
      type: Boolean,
      default: false,
    },
    is_customizable: {
      type: Boolean,
      default: false,
    },
    default_size_id: {
      type: Schema.Types.ObjectId,
      ref: 'ItemSize',
      default: null,
    },
    modifier_groups: {
      type: [
        {
          modifier_group_id: {
            type: Schema.Types.ObjectId,
            ref: 'ModifierGroup',
            required: true,
          },
          display_order: {
            type: Number,
            default: 0,
            min: 0,
          },
          modifier_overrides: {
            type: [
              {
                modifier_id: {
                  type: Schema.Types.ObjectId,
                  ref: 'Modifier',
                  required: true,
                },
                prices_by_size: {
                  type: [
                    {
                      sizeCode: {
                        type: String,
                        enum: ['S', 'M', 'L', 'XL', 'XXL'],
                        required: true,
                      },
                      priceDelta: {
                        type: Number,
                        required: true,
                        default: 0,
                      },
                    },
                  ],
                  validate: {
                    validator: function (v: any[]) {
                      if (!v || v.length === 0) return true;
                      const sizeCodes = v.map((ps) => ps.sizeCode);
                      return new Set(sizeCodes).size === sizeCodes.length;
                    },
                    message: 'Size codes must be unique within prices_by_size.',
                  },
                },
                quantity_levels: {
                  type: [
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
                      },
                      is_default: {
                        type: Boolean,
                        default: false,
                      },
                      display_order: {
                        type: Number,
                        default: 0,
                      },
                      is_active: {
                        type: Boolean,
                        default: true,
                      },
                    },
                  ],
                  validate: {
                    validator: function (v: any[]) {
                      if (!v || v.length === 0) return true;
                      return v.filter((ql) => ql.is_default).length <= 1;
                    },
                    message: 'Only one quantity level can be set as default.',
                  },
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ItemSchema.index({ category_id: 1 });
ItemSchema.index({ name: 1 });
ItemSchema.index({ 'modifier_groups.modifier_group_id': 1 });

export const ItemModel = mongoose.model<ItemDocument>('Item', ItemSchema);
