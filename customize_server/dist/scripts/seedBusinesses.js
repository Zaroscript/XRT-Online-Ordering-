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
const seedData = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        console.log('🔌 Connected to database');
        // Find or create a user to own the businesses
        let owner = await UserModel_1.UserModel.findOne({ email: 'owner@example.com' });
        if (!owner) {
            console.log('Creating dummy owner...');
            owner = new UserModel_1.UserModel({
                name: 'Business Owner',
                email: 'owner@example.com',
                password: 'password123',
                role: 'client',
                isApproved: true,
            });
            await owner.save();
            console.log('✅ Dummy owner created');
        }
        else {
            console.log('Found existing dummy owner');
        }
        // Dummy Businesses
        const businesses = [
            {
                id: 'biz_001',
                owner: owner._id,
                name: 'Gourmet Burger Kitchen',
                legal_name: 'GBK Ltd',
                primary_content_name: 'John Doe',
                primary_content_email: 'john@gbk.com',
                primary_content_phone: '1234567890',
                description: 'Best burgers in town',
                isActive: true,
            },
            {
                id: 'biz_002',
                owner: owner._id,
                name: 'Pizza Express',
                legal_name: 'Pizza Express Inc',
                primary_content_name: 'Jane Smith',
                primary_content_email: 'jane@pizza.com',
                primary_content_phone: '0987654321',
                description: 'Authentic Italian pizza',
                isActive: true,
            },
        ];
        console.log('Creating businesses...');
        // We use a loop or Promise.all to ensure we get the created docs back with _ids
        const createdBusinesses = [];
        for (const bizData of businesses) {
            // Check if exists to avoid dupes if running multiple times
            let biz = await BusinessModel_1.BusinessModel.findOne({ id: bizData.id });
            if (!biz) {
                biz = new BusinessModel_1.BusinessModel(bizData);
                await biz.save();
                console.log(`✅ Created business: ${biz.name}`);
            }
            else {
                console.log(`ℹ️ Business already exists: ${biz.name}`);
            }
            createdBusinesses.push(biz);
        }
        // Note: Location seeding is commented out until Location module is refactored
        // Uncomment and update when LocationModel is available in Clean Architecture
        /*
        // Dummy Locations
        // Linking to the first business
        const biz1 = createdBusinesses.find(b => b.id === 'biz_001');
        const biz2 = createdBusinesses.find(b => b.id === 'biz_002');
    
        const locations = [];
    
        if (biz1) {
          locations.push({
            id: 'loc_001',
            business_id: biz1._id,
            branch_name: 'GBK Downtown',
            address: {
              street: '123 Main St',
              city: 'Metropolis',
              state: 'NY',
              zipCode: '10001',
              country: 'US',
            },
            contact: {
              phone: '111-222-3333',
              email: 'downtown@gbk.com',
            },
            longitude: -74.006,
            latitude: 40.7128,
            timeZone: 'America/New_York',
            opening: [
              { day_of_week: 'monday', open_time: '09:00', close_time: '22:00' },
              { day_of_week: 'tuesday', open_time: '09:00', close_time: '22:00' },
              { day_of_week: 'wednesday', open_time: '09:00', close_time: '22:00' },
              { day_of_week: 'thursday', open_time: '09:00', close_time: '22:00' },
              { day_of_week: 'friday', open_time: '09:00', close_time: '23:00' },
              { day_of_week: 'saturday', open_time: '10:00', close_time: '23:00' },
              { day_of_week: 'sunday', open_time: '10:00', close_time: '21:00' },
            ],
          });
        }
    
        if (biz2) {
          locations.push({
            id: 'loc_002',
            business_id: biz2._id,
            branch_name: 'Pizza Express Mall',
            address: {
              street: '456 Mall Ave',
              city: 'Gotham',
              state: 'NJ',
              zipCode: '07001',
              country: 'US',
            },
            contact: {
              phone: '444-555-6666',
              email: 'mall@pizza.com',
            },
            longitude: -74.123,
            latitude: 40.845,
            timeZone: 'America/New_York',
            opening: [
              { day_of_week: 'monday', open_time: '11:00', close_time: '22:00' },
              { day_of_week: 'tuesday', open_time: '11:00', close_time: '22:00' },
              { day_of_week: 'wednesday', open_time: '11:00', close_time: '22:00' },
              { day_of_week: 'thursday', open_time: '11:00', close_time: '22:00' },
              { day_of_week: 'friday', open_time: '11:00', close_time: '23:00' },
              { day_of_week: 'saturday', open_time: '11:00', close_time: '23:00' },
              { day_of_week: 'sunday', open_time: '12:00', close_time: '21:00' },
            ],
          });
        }
    
        console.log('Creating locations...');
        for (const locData of locations) {
          let loc = await LocationModel.findOne({ id: locData.id });
          if (!loc) {
            loc = new LocationModel(locData);
            await loc.save();
            console.log(`✅ Created location: ${loc.branch_name}`);
          } else {
            console.log(`ℹ️ Location already exists: ${loc.branch_name}`);
          }
        }
        */
        console.log('🎉 Seeding successfully completed!');
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
