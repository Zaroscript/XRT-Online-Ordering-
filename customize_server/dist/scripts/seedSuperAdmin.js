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
const roles_1 = require("../src/shared/constants/roles");
const seedSuperAdmin = async () => {
    try {
        // 1. Connect to MongoDB
        console.log('Connecting to database...');
        await (0, connection_1.connectDatabase)();
        console.log('✅ Connected to MongoDB');
        // 2. Define Super Admin Data
        const superAdminData = {
            name: 'Andrew Azer',
            email: 'andrewazer18@gmail.com', // Change this if needed
            password: '21720015146', // Change this if needed
            role: 'super_admin',
            isApproved: true,
            isBanned: false,
        };
        // 3. Check if user already exists
        const existingUser = await UserModel_1.UserModel.findOne({ email: superAdminData.email });
        if (existingUser) {
            console.log(`User with email ${superAdminData.email} already exists.`);
            // Optional: Update to super_admin if they exist but aren't super admin
            if (existingUser.role !== 'super_admin') {
                console.log('Updating existing user to super_admin role...');
                existingUser.role = roles_1.UserRole.SUPER_ADMIN;
                existingUser.setDefaultPermissions();
                await existingUser.save();
                console.log('✅ User updated to super_admin.');
            }
        }
        else {
            // 4. Create new Super Admin
            console.log('Creating new Super Admin user...');
            const user = new UserModel_1.UserModel(superAdminData);
            // Explicitly set default permissions (though pre-save hook handles it)
            user.setDefaultPermissions();
            await user.save();
            console.log('✅ Super Admin created successfully!');
        }
        // 5. Verify Permissions
        const admin = await UserModel_1.UserModel.findOne({ email: superAdminData.email });
        if (admin) {
            console.log(`Admin Role: ${admin.role}`);
            console.log(`Permissions count: ${admin.permissions.length}`);
        }
    }
    catch (error) {
        console.error('❌ Error seeding super admin:', error);
        process.exit(1);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
seedSuperAdmin();
