import mongoose, { Schema, Document } from 'mongoose';
import { BusinessSettings } from '../../../domain/entities/BusinessSettings';

export interface BusinessSettingsDocument extends Omit<BusinessSettings, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const BusinessSettingsSchema = new Schema<BusinessSettingsDocument>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId as any,
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
            type: String,
            required: true,
          },
          open_time: String,
          close_time: String,
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
        type: Number,
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
      zones: [
        {
          radius: { type: Number, default: 0 },
          fee: { type: Number, default: 0 },
          min_order: { type: Number, default: 0 },
        },
      ],
    },
    fees: {
      service_fee: {
        type: Number,
        default: 0,
      },
      tip_options: [Number],
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
      auto_accept_orders: {
        type: Boolean,
        default: false,
      },
      auto_accept_order_types: [String],
      auto_accept_ready_time_pickup: {
        type: Number,
        default: 0,
      },
      auto_accept_ready_time_delivery: {
        type: Number,
        default: 0,
      },
    },
    siteLink: { type: String, default: '' },
    isProductReview: { type: Boolean, default: false },
    enableTerms: { type: Boolean, default: false },
    termsPage: {
      title: { type: String, default: '' },
      body: { type: String, default: '' },
    },
    enableCoupons: { type: Boolean, default: false },
    enableEmailForDigitalProduct: { type: Boolean, default: false },
    enableReviewPopup: { type: Boolean, default: false },
    reviewSystem: { type: String, default: 'review_single_time' },
    maxShopDistance: { type: Number, default: 0 },
    minimumOrderAmount: { type: Number, default: 0 },
    siteTitle: { type: String, default: '' },
    siteSubtitle: { type: String, default: '' },
    logo: {
      type: Object,
      default: {},
    },
    collapseLogo: {
      type: Object,
      default: {},
    },
    favicon: {
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
      emailAddress: { type: String, default: '' },
    },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    heroSlides: [
      {
        bgImage: { type: Object, default: {} },
        bgType: { type: String, default: 'image' },
        bgVideo: { type: Object, default: {} },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        subtitleTwo: { type: String, default: '' },
        offer: { type: String, default: '' },
        btnText: { type: String, default: '' },
        btnLink: { type: String, default: '' },
      },
    ],
    offerCards: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: Object, default: {} },
        couponCode: { type: String, default: '' },
        showCouponCode: { type: Boolean, default: false },
      },
    ],
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
    seoSettings: {
      type: Schema.Types.Mixed,
      default: {},
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
    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },
    operationsSettings: {
      mode: {
        type: String,
        enum: ['OPEN_NORMAL', 'SCHEDULED_ONLY', 'ORDERS_PAUSED', 'FULL_MAINTENANCE'],
        default: 'OPEN_NORMAL',
      },
      manualOverride: {
        type: Boolean,
        default: false,
      },
      overrideUntil: {
        type: Date,
        default: null,
      },
      messageTitle: {
        type: String,
        default: '',
      },
      messageBody: {
        type: String,
        default: '',
      },
      showCountdown: {
        type: Boolean,
        default: true,
      },
      maintenanceTheme: {
        type: String,
        default: 'restaurant-premium',
      },
      updatedAt: {
        type: Date,
      },
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
      newsLetterDescription: { type: String, default: '' },
      aboutUsTitle: { type: String, default: '' },
      aboutUsDescription: { type: String, default: '' },
      contactUsTitle: { type: String, default: '' },
    },
    footer_text: { type: String, default: '' },
    copyrightText: { type: String, default: '' },
    messages: {
      closed_message: { type: String, default: '' },
      not_accepting_orders_message: { type: String, default: '' },
    },
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
    nmiPublicKey: {
      type: String,
      default: '',
    },
    nmiPrivateKey: {
      type: String,
      default: '',
    },
    authorizeNetPublicKey: {
      type: String,
      default: '',
    },
    authorizeNetApiLoginId: {
      type: String,
      default: '',
    },
    authorizeNetTransactionKey: {
      type: String,
      default: '',
    },
    authorizeNetMode: {
      type: String,
      enum: ['ui', 'iframe'],
      default: 'ui',
    },
    authorizeNetEnvironment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    useCashOnDelivery: {
      type: Boolean,
      default: false,
    },
    paymentGateway: {
      type: [Object],
      default: [],
    },
    defaultPaymentGateway: {
      type: String,
      default: '',
    },
    useEnableGateway: {
      type: Boolean,
      default: true,
    },
    showMenuSection: {
      type: Boolean,
      default: true,
    },
    primary_color: {
      type: String,
      default: "#5C9963",
    },
    secondary_color: {
      type: String,
      default: "#2F3E30",
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const BusinessSettingsModel = mongoose.model<BusinessSettingsDocument>(
  'BusinessSettings',
  BusinessSettingsSchema
);
