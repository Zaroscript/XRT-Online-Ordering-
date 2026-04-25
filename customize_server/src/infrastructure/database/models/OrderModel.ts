import mongoose, { Schema, Document, Types } from 'mongoose';
import { Order, OrderStatus, OrderType, ServiceTimeType } from '../../../domain/entities/Order';

export interface OrderDocument extends Omit<Order, 'id' | 'customer_id' | 'business_id'>, Document {
  _id: Types.ObjectId;
  customer_id: Types.ObjectId | string;
  business_id: Types.ObjectId | string;
}

const OrderItemModifierSchema = new Schema(
  {
    modifier_id: { type: Schema.Types.ObjectId, ref: 'Modifier', required: true },
    name_snapshot: { type: String, required: true },
    modifier_quantity_id: { type: Schema.Types.ObjectId },
    quantity_label_snapshot: { type: String },
    unit_price_delta: { type: Number, required: true, default: 0 },
    selected_side: { type: String, enum: ['LEFT', 'RIGHT', 'WHOLE'] },
  },
  { _id: true } // Generate embedded _id
);

const OrderItemSchema = new Schema(
  {
    menu_item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    size_id: { type: Schema.Types.ObjectId },
    name_snap: { type: String, required: true },
    size_snap: { type: String },
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    modifier_totals: { type: Number, required: true, default: 0 },
    line_subtotal: { type: Number, required: true },
    special_notes: { type: String },
    modifiers: { type: [OrderItemModifierSchema], default: [] },
    /** Kitchen section name for print routing (resolved from Item → Category at order creation) */
    kitchen_section_snapshot: { type: String, default: null },
  },
  { _id: true } // Generate embedded _id
);

const OrderMoneySchema = new Schema(
  {
    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    delivery_fee: { type: Number, required: true, default: 0 },
    tax_total: { type: Number, required: true, default: 0 },
    tips: { type: Number, required: true, default: 0 },
    total_amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    payment: { type: String, required: true }, // ENUM or string
    payment_id: { type: String },
    payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    coupon_code: { type: String },
    rewards_points_used: { type: Number },
    loyalty_discount_amount: { type: Number, default: 0 },
    refunded_amount: { type: Number, default: 0 },
    net_paid_amount: { type: Number, default: 0 },
    gateway_captured_amount: { type: Number, default: 0 },
    gateway_refundable_remaining: { type: Number, default: 0 },
    card_type: { type: String },
    last_4: { type: String },
  },
  { _id: false }
);

const OrderDeliverySchema = new Schema(
  {
    name: { type: String },
    phone: { type: String },
    address: { type: Schema.Types.Mixed }, // flexible object for address data
  },
  { _id: false }
);

const OrderPrintStatusSchema = new Schema(
  {
    printer_id: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], required: true },
    attempted_at: { type: Date },
    error: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order_number: { type: String, required: true, unique: true, index: true },
    order_type: { type: String, enum: ['pickup', 'delivery'], required: true },
    service_time_type: { type: String, enum: ['ASAP', 'Schedule'], required: true },
    schedule_time: { type: Date, default: null },
    ready_time: { type: Date },
    actual_ready_time: { type: Date },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'inkitchen',
        'ready',
        'out of delivery',
        'completed',
        'canceled',
      ],
      default: 'pending',
      index: true,
    },
    cancelled_at: { type: Date },
    completed_at: { type: Date },
    cancelled_reason: { type: String },
    cancelled_by: { type: String }, // e.g., 'customer', 'admin', 'system'
    money: { type: OrderMoneySchema, required: true },
    payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    delivery: { type: OrderDeliverySchema },
    notes: { type: String },
    items: { type: [OrderItemSchema], required: true },
    print_status: { type: [OrderPrintStatusSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for better query performance
OrderSchema.index({ created_at: -1 });
OrderSchema.index({ status: 1 });

export const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);
