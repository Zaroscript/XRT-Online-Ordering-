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
exports.WithdrawModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Withdraw_1 = require("../../../domain/entities/Withdraw");
const WithdrawSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive'],
    },
    status: {
        type: String,
        enum: Object.values(Withdraw_1.WithdrawStatus),
        default: Withdraw_1.WithdrawStatus.PENDING,
        index: true,
    },
    business_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Business',
        required: [true, 'Business ID is required'],
        index: true,
    },
    payment_method: {
        type: String,
        required: [true, 'Payment method is required'],
    },
    details: {
        type: String,
    },
    note: {
        type: String,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Indexes
WithdrawSchema.index({ business_id: 1, status: 1 });
WithdrawSchema.index({ createdBy: 1 });
WithdrawSchema.index({ status: 1 });
exports.WithdrawModel = mongoose_1.default.model('Withdraw', WithdrawSchema);
