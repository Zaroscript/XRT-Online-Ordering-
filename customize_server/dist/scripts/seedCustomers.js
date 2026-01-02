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
const UserModel_1 = require("../src/infrastructure/database/models/UserModel");
const BusinessModel_1 = require("../src/infrastructure/database/models/BusinessModel");
// Note: Customer and Location models not yet refactored - will need to be updated when modules are refactored
// For now, we'll skip customer seeding or use a placeholder
const seedData = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        console.log('🔌 Connected to database');
        // Find required relations
        let owner = await UserModel_1.UserModel.findOne({ email: 'owner@example.com' });
        if (!owner) {
            console.log('Owner not found, searching for super_admin...');
            owner = await UserModel_1.UserModel.findOne({ role: 'super_admin' });
        }
        if (!owner) {
            console.log('No owner or super admin found. Creating owner...');
            owner = new UserModel_1.UserModel({
                name: 'Business Owner',
                email: 'owner@example.com',
                password: 'password123',
                role: 'client',
                isApproved: true,
            });
            await owner.save();
        }
        console.log(`Using user: ${owner.email} (${owner._id})`);
        const business = await BusinessModel_1.BusinessModel.findOne({ id: 'biz_001' });
        if (!business) {
            throw new Error('Business biz_001 not found. Please run seedBusinesses.ts first.');
        }
        // Note: Customer and Location seeding is commented out until modules are refactored
        // Uncomment and update when CustomerModel and LocationModel are available in Clean Architecture
        /*
        const location = await LocationModel.findOne({ id: 'loc_001' });
        if (!location) {
          throw new Error('Location loc_001 not found. Please run seedBusinesses.ts first.');
        }
    
        // Dummy Customers
        const customers = [
          {
            name: 'Alice Wonderland',
            email: 'alice@example.com',
            phoneNumber: '555-0101',
            business_id: business._id,
            location_id: location._id,
            createdBy: owner._id,
            rewards: 150,
            preferences: {
              dietary: ['vegetarian'],
              favoriteItems: ['Kale Salad', 'Veggie Burger'],
            },
            loyaltyTier: 'bronze',
            totalSpent: 150,
            totalOrders: 5,
          },
          {
            name: 'Bob Builder',
            email: 'bob@example.com',
            phoneNumber: '555-0102',
            business_id: business._id,
            location_id: location._id,
            createdBy: owner._id,
            rewards: 550,
            preferences: {
              favoriteItems: ['Double Cheeseburger'],
            },
            loyaltyTier: 'gold',
            totalSpent: 600,
            totalOrders: 20,
          },
          {
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            phoneNumber: '555-0103',
            business_id: business._id,
            location_id: location._id,
            createdBy: owner._id,
            rewards: 0,
            preferences: {
              allergies: ['peanuts'],
            },
            loyaltyTier: 'bronze',
            totalSpent: 50,
            totalOrders: 2,
          },
        ];
    
        console.log('Creating customers...');
        for (const customerData of customers) {
          // Check if exists by email to avoid dupes
          let customer = await CustomerModel.findOne({ email: customerData.email });
          if (!customer) {
            customer = new CustomerModel(customerData);
            await customer.save();
            console.log(`✅ Created customer: ${customer.name}`);
          } else {
            console.log(`ℹ️ Customer already exists: ${customer.name}`);
          }
        }
        */
        console.log('⚠️ Customer seeding skipped - Customer module not yet refactored to Clean Architecture');
        console.log('🎉 Customer seeding script completed!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
seedData();
