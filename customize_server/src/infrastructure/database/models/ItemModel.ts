import mongoose, { Schema, Document } from 'mongoose';
import { Item } from '../../../domain/entities/Item';

export interface ItemDocument extends Omit<Item, 'id' | 'category_id'>, Document {
    _id: mongoose.Types.ObjectId;
    category_id: mongoose.Types.ObjectId | string;
}

const ItemSchema = new Schema<ItemDocument>(
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
            default: 0,
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
        sizes: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    price: {
                        type: Number,
                        required: true,
                    },
                    is_default: {
                        type: Boolean,
                        default: false,
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

ItemSchema.index({ business_id: 1, category_id: 1 });
ItemSchema.index({ business_id: 1, name: 1 });

export const ItemModel = mongoose.model<ItemDocument>('Item', ItemSchema);
