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
exports.BusinessModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BusinessSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: [true, 'Please provide a business ID'],
        unique: true,
        trim: true,
        index: true,
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the business owner'],
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a business name'],
        maxlength: [100, 'Business name cannot be more than 100 characters'],
        trim: true,
    },
    legal_name: {
        type: String,
        required: [true, 'Please provide a legal business name'],
        maxlength: [100, 'Legal name cannot be more than 100 characters'],
        trim: true,
    },
    primary_content_name: {
        type: String,
        required: [true, 'Please provide a primary contact name'],
        maxlength: [100, 'Contact name cannot be more than 100 characters'],
        trim: true,
    },
    primary_content_email: {
        type: String,
        required: [true, 'Please provide a primary contact email'],
        lowercase: true,
        trim: true,
    },
    primary_content_phone: {
        type: String,
        required: [true, 'Please provide a primary contact phone'],
        trim: true,
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true },
    },
    logo: {
        type: String,
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
    },
    google_maps_verification: {
        type: Boolean,
        default: false,
    },
    social_media: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        whatsapp: { type: String, trim: true },
        tiktok: { type: String, trim: true },
    },
    header_info: {
        type: String,
        trim: true,
    },
    messages: {
        closed_message: { type: String, trim: true },
        not_accepting_orders_message: { type: String, trim: true },
    },
    timezone: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Indexes
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ id: 1 });
// Filter out inactive businesses by default
BusinessSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});
exports.BusinessModel = mongoose_1.default.model('Business', BusinessSchema);
