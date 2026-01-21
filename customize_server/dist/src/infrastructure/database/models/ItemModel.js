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
exports.ItemModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ItemSchema = new mongoose_1.Schema({
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
    description: {
        type: String,
        trim: true,
    },
    sort_order: {
        type: Number,
        default: 0,
    },
    is_active: {
        type: Boolean,
        default: true,
        index: true,
    },
    base_price: {
        type: Number,
        required: true,
        min: 0,
    },
    sizes: {
        type: [
            {
                size_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemSize', required: true },
                price: { type: Number, required: true, min: 0 },
                is_default: { type: Boolean, default: false },
                is_active: { type: Boolean, default: true },
            },
        ],
        default: [],
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true,
    },
    image: {
        type: String,
    },
    image_public_id: {
        type: String,
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    is_signature: {
        type: Boolean,
        default: false,
    },
    max_per_order: {
        type: Number,
    },
    is_sizeable: {
        type: Boolean,
        default: false,
    },
    is_customizable: {
        type: Boolean,
        default: false,
    },
    default_size_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ItemSize',
        default: null,
    },
    modifier_groups: {
        type: [
            {
                modifier_group_id: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'ModifierGroup',
                    required: true,
                },
                display_order: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                modifier_overrides: {
                    type: [
                        {
                            modifier_id: {
                                type: mongoose_1.Schema.Types.ObjectId,
                                ref: 'Modifier',
                                required: true,
                            },
                            prices_by_size: {
                                type: [
                                    {
                                        sizeCode: {
                                            type: String,
                                            enum: ['S', 'M', 'L', 'XL', 'XXL'],
                                            required: true,
                                        },
                                        priceDelta: {
                                            type: Number,
                                            required: true,
                                            default: 0,
                                        },
                                    },
                                ],
                                validate: {
                                    validator: function (v) {
                                        if (!v || v.length === 0)
                                            return true;
                                        const sizeCodes = v.map((ps) => ps.sizeCode);
                                        return new Set(sizeCodes).size === sizeCodes.length;
                                    },
                                    message: 'Size codes must be unique within prices_by_size.',
                                },
                            },
                            quantity_levels: {
                                type: [
                                    {
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
                                        },
                                        is_default: {
                                            type: Boolean,
                                            default: false,
                                        },
                                        display_order: {
                                            type: Number,
                                            default: 0,
                                        },
                                        is_active: {
                                            type: Boolean,
                                            default: true,
                                        },
                                    },
                                ],
                                validate: {
                                    validator: function (v) {
                                        if (!v || v.length === 0)
                                            return true;
                                        return v.filter((ql) => ql.is_default).length <= 1;
                                    },
                                    message: 'Only one quantity level can be set as default.',
                                },
                            },
                        },
                    ],
                    default: [],
                },
            },
        ],
        default: [],
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
ItemSchema.index({ business_id: 1, category_id: 1 });
ItemSchema.index({ business_id: 1, name: 1 });
ItemSchema.index({ 'modifier_groups.modifier_group_id': 1 });
exports.ItemModel = mongoose_1.default.model('Item', ItemSchema);
