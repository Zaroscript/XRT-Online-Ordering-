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
require("dotenv/config");
const connection_1 = require("../src/infrastructure/database/connection");
const ItemModel_1 = require("../src/infrastructure/database/models/ItemModel");
const CategoryModel_1 = require("../src/infrastructure/database/models/CategoryModel");
const BusinessModel_1 = require("../src/infrastructure/database/models/BusinessModel");
const seedItems = async () => {
    try {
        console.log('Connecting to database...');
        await (0, connection_1.connectDatabase)();
        console.log('✅ Connected to MongoDB');
        // 1. Get Business
        let business = await BusinessModel_1.BusinessModel.findOne({ id: 'biz_001' });
        if (!business) {
            business = await BusinessModel_1.BusinessModel.findOne();
        }
        if (!business) {
            console.error('❌ No business found. Please run seedBusinesses first.');
            process.exit(1);
        }
        const businessId = business.id;
        console.log(`Using Business ID: ${businessId}`);
        // 2. Get Categories
        const categories = await CategoryModel_1.CategoryModel.find({ business_id: businessId });
        if (categories.length === 0) {
            console.error('❌ No categories found. Please run seedCategories first.');
            process.exit(1);
        }
        console.log(`Found ${categories.length} categories.`);
        // 3. Clear existing items
        console.log('🧹 Clearing existing items...');
        await ItemModel_1.ItemModel.deleteMany({ business_id: businessId });
        // 4. Generate Items
        const items = [];
        const adjectives = ['Spicy', 'Sweet', 'Savory', 'Crispy', 'Fresh', 'Grilled', 'Roasted', 'Steamed', 'Fried', 'Baked'];
        const nouns = ['Burger', 'Pizza', 'Salad', 'Pasta', 'Soup', 'Sandwich', 'Wrap', 'Taco', 'Sushi', 'Steak'];
        const sizeNames = ['Small', 'Medium', 'Large', 'Extra Large'];
        for (let i = 0; i < 20; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            const is_active = Math.random() > 0.3; // 70% chance of being active
            const is_available = Math.random() > 0.2; // 80% chance of being available
            const is_sizeable = Math.random() > 0.6; // 40% chance of being sizeable
            const is_customizable = Math.random() > 0.7; // 30% chance of being customizable
            const item = {
                business_id: businessId,
                category_id: randomCategory._id,
                name: `${randomAdjective} ${randomNoun} ${i + 1}`,
                description: `A delicious ${randomAdjective.toLowerCase()} ${randomNoun.toLowerCase()} made with fresh ingredients.`,
                is_active: is_active,
                is_available: is_available,
                is_signature: Math.random() > 0.8, // 20% chance of being signature
                is_sizeable: is_sizeable,
                is_customizable: is_customizable,
                image: 'https://placehold.co/400x300', // Placeholder image
                sort_order: i,
                max_per_order: Math.floor(Math.random() * 10) + 1,
            };
            if (is_sizeable) {
                // Items with sizes - no base_price needed
                const numSizes = Math.floor(Math.random() * 3) + 2; // 2-4 sizes
                const basePrice = parseFloat((Math.random() * 20 + 5).toFixed(2)); // Base price for calculation
                item.sizes = [];
                const defaultIndex = Math.floor(Math.random() * numSizes); // Random default size
                for (let j = 0; j < numSizes; j++) {
                    const sizeMultiplier = [0.8, 1.0, 1.2, 1.5][j] || 1.0; // Price multipliers for different sizes
                    item.sizes.push({
                        name: sizeNames[j] || `Size ${j + 1}`,
                        price: parseFloat((basePrice * sizeMultiplier).toFixed(2)),
                        is_default: j === defaultIndex,
                    });
                }
                // Set base_price to 0 when using sizes (or omit, will default to 0)
                item.base_price = 0;
            }
            else {
                // Items without sizes - use base_price
                item.base_price = parseFloat((Math.random() * 20 + 5).toFixed(2)); // Random price between 5 and 25
                item.sizes = [];
            }
            items.push(item);
        }
        // 5. Insert Items
        console.log(`Seeding ${items.length} items...`);
        await ItemModel_1.ItemModel.insertMany(items);
        console.log('🎉 Items seeding completed!');
    }
    catch (error) {
        console.error('❌ Error seeding items:', error);
        process.exit(1);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
seedItems();
