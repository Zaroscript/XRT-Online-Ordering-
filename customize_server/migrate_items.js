const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    business_id: String,
  },
  { strict: false }
);
const ItemModel = mongoose.model('ItemDebug', ItemSchema, 'items');

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const incorrectId = 'biz_001';
    const correctId = '1e6c98c9-2ed5-45d9-807f-5cf4e0b0d345'; // "Test Business" CID

    const itemsToUpdate = await ItemModel.countDocuments({ business_id: incorrectId });
    console.log(`Found ${itemsToUpdate} items with business_id: ${incorrectId}`);

    if (itemsToUpdate > 0) {
      console.log(`Migrating items to business_id: ${correctId}...`);
      const result = await ItemModel.updateMany(
        { business_id: incorrectId },
        { $set: { business_id: correctId } }
      );
      console.log(`Updated ${result.modifiedCount} items.`);
    } else {
      console.log('No items found to migrate.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
