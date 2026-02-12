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
exports.CouponModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CouponSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true, enum: ['fixed', 'percentage', 'free_shipping'] },
    amount: { type: Number, required: true },
    active_from: { type: String, required: true },
    expire_at: { type: String, required: true },
    target: { type: Boolean, default: false },
    shop_id: { type: String },
    is_approve: { type: Boolean, default: true },
    minimum_cart_amount: { type: Number, default: 0 },
    translated_languages: [{ type: String }],
    language: { type: String, default: 'en' },
    orders: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Order' }],
    max_conversions: { type: Number, default: null },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Ensure code is unique per shop? Or globally? Usually per shop or globally unique.
// Let's index code for faster lookups.
CouponSchema.index({ code: 1 });
exports.CouponModel = mongoose_1.default.model('Coupon', CouponSchema);
