import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Settings must belong to a business'],
      unique: true,
    },
    operating_hours: {
      auto_close: {
        type: Boolean,
        default: false,
      },
      schedule: [
        {
          day: {
            type: String, // e.g., 'Monday' or 0-6
            required: true,
          },
          open_time: String, // '09:00'
          close_time: String, // '22:00'
          is_closed: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    delivery: {
      enabled: {
        type: Boolean,
        default: false,
      },
      radius: {
        type: Number, // in km
        default: 0,
      },
      fee: {
        type: Number,
        default: 0,
      },
      min_order: {
        type: Number,
        default: 0,
      },
    },
    fees: {
      service_fee: {
        type: Number,
        default: 0,
      },
    },
    taxes: {
      sales_tax: {
        type: Number, // percentage
        default: 0,
      },
      meals_tax: {
        type: Number, // percentage
        default: 0,
      },
    },
    orders: {
      accept_orders: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);

export default BusinessSettings;
