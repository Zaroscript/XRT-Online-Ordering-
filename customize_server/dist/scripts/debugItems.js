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
const connection_1 = require("../src/infrastructure/database/connection");
const ItemRepository_1 = require("../src/infrastructure/repositories/ItemRepository");
require("../src/infrastructure/database/models/CategoryModel"); // Register model
const debugItems = async () => {
    try {
        console.log('Connecting to database...');
        await (0, connection_1.connectDatabase)();
        console.log('✅ Connected to MongoDB');
        const repo = new ItemRepository_1.ItemRepository();
        console.log('🧪 Testing findAll...');
        // Mock filters
        const result = await repo.findAll({ limit: 5, page: 1 });
        console.log(`Found ${result.items.length} items. Total: ${result.total}`);
        if (result.items.length > 0) {
            const firstItem = result.items[0];
            console.log('--- First Item Domain Object ---');
            console.log(JSON.stringify(firstItem, null, 2));
            if (firstItem.category) {
                console.log('✅ Category IS populated in Domain Object.');
            }
            else {
                console.log('❌ Category IS MISSING in Domain Object.');
            }
            if (firstItem.base_price !== undefined) {
                console.log('✅ Base Price is:', firstItem.base_price);
            }
            else {
                console.log('❌ Base Price IS MISSING.');
            }
        }
        else {
            console.log('❌ No items returned by findAll.');
        }
    }
    catch (error) {
        console.error('❌ Error debugging items:', error);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        process.exit(0);
    }
};
debugItems();
