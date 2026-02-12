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
exports.ModifierModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PricesBySizeSchema = new mongoose_1.Schema({
    sizeCode: {
        type: String,
        required: false,
    },
    size_id: {
        type: String,
        required: false,
    },
    priceDelta: {
        type: Number,
        required: true,
    },
}, { _id: false });
const QuantityLevelSchema = new mongoose_1.Schema({
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
        min: 0,
    },
    is_default: {
        type: Boolean,
        default: false,
    },
    display_order: {
        type: Number,
        default: 0,
        min: 0,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    prices_by_size: {
        type: [PricesBySizeSchema],
        default: [],
    },
}, { _id: false });
const ModifierSchema = new mongoose_1.Schema({
    modifier_group_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ModifierGroup',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    display_order: {
        type: Number,
        default: 0,
        min: 0,
    },
    is_active: {
        type: Boolean,
        default: true,
        index: true,
    },
    sides_config: {
        enabled: {
            type: Boolean,
            default: false,
        },
        allowed_sides: {
            type: [String],
            enum: ['LEFT', 'RIGHT', 'WHOLE'],
            default: [],
        },
    },
    // Modifier-level configuration (overrides group defaults)
    quantity_levels: {
        type: [QuantityLevelSchema],
        default: [],
    },
    prices_by_size: {
        type: [PricesBySizeSchema],
        default: [],
    },
    deleted_at: {
        type: Date,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Note: Default modifier validation is handled in the repository/use case layer
// to avoid circular dependencies in Mongoose pre-hooks
ModifierSchema.index({ modifier_group_id: 1, name: 1 }, { unique: true });
ModifierSchema.index({ modifier_group_id: 1, is_active: 1 });
ModifierSchema.index({ modifier_group_id: 1, deleted_at: 1 });
exports.ModifierModel = mongoose_1.default.model('Modifier', ModifierSchema);
