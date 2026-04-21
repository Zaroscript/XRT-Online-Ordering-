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

/**
 * Ensures a super admin user exists in the `users` collection.
 * - If the email already exists and is already super_admin → skips.
 * - If the email already exists but has a different role → upgrades to super_admin.
 * - If the email does not exist → creates a new super_admin.
 */
async function ensureSuperAdmin(data: SuperAdminData): Promise<void> {
  const existingUser = await UserModel.findOne({ email: data.email });

  if (existingUser) {
    console.log(`  ℹ️  User already exists: ${data.email}`);

    if (existingUser.role !== 'super_admin') {
      console.log(`  🔄 Upgrading role to super_admin...`);
      existingUser.role = UserRole.SUPER_ADMIN;
      existingUser.setDefaultPermissions();
      await existingUser.save();
      console.log(`  ✅ Role upgraded successfully.`);
    } else {
      console.log(`  ✅ Already a super_admin — no changes needed.`);
    }
  } else {
    console.log(`  ➕ Creating new super_admin: ${data.email}`);
    const user = new UserModel(data);
    user.setDefaultPermissions();
    await user.save();
    console.log(`  ✅ Created successfully.`);
  }

  // Verify
  const admin = await UserModel.findOne({ email: data.email });
  if (admin) {
    console.log(`  📋 Role: ${admin.role} | Permissions: ${admin.permissions.length}`);
  }
}

const superAdmins: SuperAdminData[] = [
  {
    name: 'Andrew Azer',
    email: 'andrewazer18@gmail.com',
    password: '21720015146',
    role: 'super_admin',
    isApproved: true,
    isBanned: false,
  },
  {
    name: 'Thomas Ibrahim',
    email: 'thomas.ibrahim2020@gmail.com',
    password: 'thomasIbrahim@xrt2025',
    role: 'super_admin',
    isApproved: true,
    isBanned: false,
  },
];

const seedSuperAdmin = async (): Promise<void> => {
  try {
    console.log('\n🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB\n');

    for (const admin of superAdmins) {
      console.log(`\n--- Processing: ${admin.email} ---`);
      await ensureSuperAdmin(admin);
    }

    console.log('\n🎉 Super admin seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error seeding super admins:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedSuperAdmin();
