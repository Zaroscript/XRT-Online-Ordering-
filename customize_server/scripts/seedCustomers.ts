import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { UserModel } from '../src/infrastructure/database/models/UserModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
// Note: Customer and Location models not yet refactored - will need to be updated when modules are refactored
// For now, we'll skip customer seeding or use a placeholder

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('🔌 Connected to database');

    // Find required relations
    let owner = await UserModel.findOne({ email: 'owner@example.com' });
    if (!owner) {
      console.log('Owner not found, searching for super_admin...');
      owner = await UserModel.findOne({ role: 'super_admin' });
    }

    if (!owner) {
      console.log('No owner or super admin found. Creating owner...');
      owner = new UserModel({
        name: 'Business Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
      });
      await owner.save();
    }

    console.log(`Using user: ${owner.email} (${owner._id})`);

    const business = await BusinessModel.findOne({ id: 'biz_001' });
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
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();

