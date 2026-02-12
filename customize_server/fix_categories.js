const mongoose = require('mongoose');

const uri =
  'mongodb+srv://andrewazer18:SPJE7rsnfZrRZTLo@cluster0.81y8e.mongodb.net/xrt-customized?retryWrites=true&w=majority&connectTimeoutMS=30000';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get the first business
    const business = await db.collection('businesses').findOne({});
    if (!business) {
      console.error('No businesses found!');
      return;
    }
    const businessId = business._id.toString();
    console.log(`Using Business ID: ${businessId} (${business.name})`);

    // Update all categories to use this business ID
    const result = await db
      .collection('categories')
      .updateMany({}, { $set: { business_id: businessId } });

    console.log(`Updated ${result.modifiedCount} categories to business_id: ${businessId}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
