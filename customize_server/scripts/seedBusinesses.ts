import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { UserModel } from '../src/infrastructure/database/models/UserModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
// Note: Location model not yet refactored - will need to be updated when Location module is refactored
// For now, we'll skip location seeding or use a placeholder

interface BusinessData {
  id: string;
  owner: any;
  name: string;
  legal_name: string;
  primary_content_name: string;
  primary_content_email: string;
  primary_content_phone: string;
  description?: string;
  isActive: boolean;
}

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('🔌 Connected to database');

    // Find or create a user to own the businesses
    let owner = await UserModel.findOne({ email: 'owner@example.com' });

    if (!owner) {
      console.log('Creating dummy owner...');
      owner = new UserModel({
        name: 'Business Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
      });
      await owner.save();
      console.log('✅ Dummy owner created');
    } else {
      console.log('Found existing dummy owner');
    }

    // Dummy Businesses
    const businesses: BusinessData[] = [
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
      let biz = await BusinessModel.findOne({ id: bizData.id });
      if (!biz) {
        biz = new BusinessModel(bizData);
        await biz.save();
        console.log(`✅ Created business: ${biz.name}`);
      } else {
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

