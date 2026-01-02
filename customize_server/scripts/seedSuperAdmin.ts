import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { UserModel } from '../src/infrastructure/database/models/UserModel';
import { UserRole } from '../src/shared/constants/roles';

interface SuperAdminData {
  name: string;
  email: string;
  password: string;
  role: 'super_admin';
  isApproved: boolean;
  isBanned: boolean;
}

const seedSuperAdmin = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    // 2. Define Super Admin Data
    const superAdminData: SuperAdminData = {
      name: 'Andrew Azer',
      email: 'andrewazer18@gmail.com', // Change this if needed
      password: '21720015146', // Change this if needed
      role: 'super_admin',
      isApproved: true,
      isBanned: false,
    };

    // 3. Check if user already exists
    const existingUser = await UserModel.findOne({ email: superAdminData.email });

    if (existingUser) {
      console.log(`User with email ${superAdminData.email} already exists.`);

      // Optional: Update to super_admin if they exist but aren't super admin
      if (existingUser.role !== 'super_admin') {
        console.log('Updating existing user to super_admin role...');
        existingUser.role = UserRole.SUPER_ADMIN;
        existingUser.setDefaultPermissions();
        await existingUser.save();
        console.log('✅ User updated to super_admin.');
      }
    } else {
      // 4. Create new Super Admin
      console.log('Creating new Super Admin user...');
      const user = new UserModel(superAdminData);

      // Explicitly set default permissions (though pre-save hook handles it)
      user.setDefaultPermissions();

      await user.save();
      console.log('✅ Super Admin created successfully!');
    }

    // 5. Verify Permissions
    const admin = await UserModel.findOne({ email: superAdminData.email });
    if (admin) {
      console.log(`Admin Role: ${admin.role}`);
      console.log(`Permissions count: ${admin.permissions.length}`);
    }
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedSuperAdmin();

