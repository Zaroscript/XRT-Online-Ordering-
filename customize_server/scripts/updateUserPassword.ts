import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { UserModel } from '../src/infrastructure/database/models/UserModel';

const updateUserPassword = async () => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        const userName = 'Thomas Ibrahim';
        const newPassword = 'thomasIbrahim@xrt2025';

        // Find user by name (case-insensitive)
        const user = await UserModel.findOne({
            name: { $regex: new RegExp(`^${userName}$`, 'i') }
        });

        if (!user) {
            console.error(`❌ User "${userName}" not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);

        // Update password
        user.password = newPassword;
        await user.save();

        console.log('✅ Password updated successfully.');

    } catch (error) {
        console.error('❌ Error updating password:', error);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        process.exit(0);
    }
};

updateUserPassword();
