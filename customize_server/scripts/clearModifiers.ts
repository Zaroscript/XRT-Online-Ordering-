import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ModifierGroupModel } from '../src/infrastructure/database/models/ModifierGroupModel';
import { ModifierModel } from '../src/infrastructure/database/models/ModifierModel';

const clearModifiers = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing ALL modifiers and modifier groups...');

    const modifiersResult = await ModifierModel.deleteMany({});
    console.log(`Deleted ${modifiersResult.deletedCount} modifiers.`);

    const groupsResult = await ModifierGroupModel.deleteMany({});
    console.log(`Deleted ${groupsResult.deletedCount} modifier groups.`);

    console.log('🎉 Cleanup completed!');
  } catch (error) {
    console.error('❌ Error clearing modifiers:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

clearModifiers();
