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
exports.ModifierGroupModel = void 0;
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
const ModifierGroupSchema = new mongoose_1.Schema({
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
    display_name: {
        type: String,
        trim: true,
    },
    display_type: {
        type: String,
        required: true,
        enum: ['RADIO', 'CHECKBOX'],
        default: 'RADIO',
    },
    min_select: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    max_select: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    quantity_levels: {
        type: [QuantityLevelSchema],
        default: [],
    },
    is_active: {
        type: Boolean,
        default: true,
        index: true,
    },
    sort_order: {
        type: Number,
        default: 0,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Validation: max_select must be >= min_select
ModifierGroupSchema.pre('validate', function (next) {
    if (this.max_select < this.min_select) {
        next(new Error('max_select must be greater than or equal to min_select'));
    }
    else {
        next();
    }
});
// Validation: Only one quantity level can be default
ModifierGroupSchema.pre('validate', function (next) {
    if (this.quantity_levels && this.quantity_levels.length > 0) {
        const defaultCount = this.quantity_levels.filter((ql) => ql.is_default).length;
        if (defaultCount > 1) {
            next(new Error('Only one quantity level can be marked as default'));
        }
        else {
            next();
        }
    }
    else {
        next();
    }
});
ModifierGroupSchema.index({ business_id: 1, name: 1 }, { unique: true });
ModifierGroupSchema.index({ business_id: 1, is_active: 1 });
ModifierGroupSchema.index({ business_id: 1, deleted_at: 1 });
exports.ModifierGroupModel = mongoose_1.default.model('ModifierGroup', ModifierGroupSchema);
