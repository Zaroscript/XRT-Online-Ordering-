"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSettingsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BusinessSettingsSchema = new mongoose_1.Schema({
    business: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
    },
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
    currency: { type: String, default: 'USD' },
    heroSlides: [
        {
            bgImage: { type: Object, default: {} },
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            subtitleTwo: { type: String, default: '' },
            offer: { type: String, default: '' },
            btnText: { type: String, default: '' },
            btnLink: { type: String, default: '' },
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
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
exports.BusinessSettingsModel = mongoose_1.default.model('BusinessSettings', BusinessSettingsSchema);
