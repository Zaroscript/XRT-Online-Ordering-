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
        type: Number, // in miles
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
      tip_options: [{
        type: Number,
      }],
    },
    taxes: {
      sales_tax: {
        type: Number,
        default: 0,
      },
    },
    orders: {
      accept_orders: {
        type: Boolean,
        default: true,
      },
      allowScheduleOrder: {
        type: Boolean,
        default: false,
      },
      maxDays: {
        type: Number,
        default: 0,
      },
      deliveredOrderTime: {
        type: Number,
        default: 0,
      },
    },
    siteTitle: { type: String, default: '' },
    siteSubtitle: { type: String, default: '' },
    logo: {
      type: Object,
      default: {},
    },
    contactDetails: {
      location: { type: Object, default: {} },
      contact: { type: String, default: '' },
      contacts: [{ type: String }],
      socials: [
        {
          icon: String,
          url: String,
        },
      ],
      website: { type: String, default: '' },
    },
    currency: { type: String, default: 'USD' },
    heroSlides: [{
      bgImage: { type: Object, default: {} },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      btnText: { type: String, default: '' },
      btnLink: { type: String, default: '' },
    }],
    currencyOptions: {
      formation: { type: String, default: 'en-US' },
      fractions: { type: Number, default: 2 },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: Object,
      twitterHandle: String,
      twitterCardType: String,
      metaTags: String,
      canonicalUrl: String,
    },
    google: {
      isEnable: { type: Boolean, default: false },
      tagManagerId: { type: String, default: '' },
    },
    facebook: {
      isEnable: { type: Boolean, default: false },
      appId: { type: String, default: '' },
      pageId: { type: String, default: '' },
    },
    // Maintenance Mode
    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },
    maintenance: {
      image: {
        id: String,
        original: String,
        thumbnail: String,
      },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      start: { type: Date },
      until: { type: Date },
      isOverlayColor: { type: Boolean, default: false },
      overlayColor: { type: String, default: '' },
      overlayColorRange: { type: String, default: '' },
      buttonTitleOne: { type: String, default: '' },
      buttonTitleTwo: { type: String, default: '' },
      newsLetterTitle: { type: String, default: '' },
      newsLetterDescription: { type: 'String', default: '' },
      aboutUsTitle: { type: String, default: '' },
      aboutUsDescription: { type: String, default: '' },
      contactUsTitle: { type: String, default: '' },
    },

    footer_text: { type: String, default: '' },
    messages: {
      closed_message: { type: String, default: '' },
      not_accepting_orders_message: { type: String, default: '' },
    },
    // Original promoPopup
    promoPopup: {
      isEnable: {
        type: Boolean,
        default: false,
      },
      image: {
        id: String,
        original: String,
        thumbnail: String,
      },
      title: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      popupDelay: {
        type: Number,
        default: 0,
      },
      popupExpiredIn: {
        type: Number,
        default: 0,
      },
      isNotShowAgain: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);

export default BusinessSettings;
