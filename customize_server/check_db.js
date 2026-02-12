const mongoose = require('mongoose');

const uri =
  'mongodb+srv://andrewazer18:SPJE7rsnfZrRZTLo@cluster0.81y8e.mongodb.net/xrt-customized?retryWrites=true&w=majority&connectTimeoutMS=30000';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check Businesses
    const businessCount = await db.collection('businesses').countDocuments();
    console.log(`Total Businesses: ${businessCount}`);
    const businesses = await db.collection('businesses').find({}).toArray();
    businesses.forEach((b) => console.log(`Business: ${b._id} - ${b.name}`));

    // Check Categories
    const categoryCount = await db.collection('categories').countDocuments();
    console.log(`Total Categories: ${categoryCount}`);

    if (categoryCount > 0) {
      const categories = await db.collection('categories').find({}).limit(5).toArray();
      console.log('Sample Categories:');
      categories.forEach((c) => {
        console.log(
          `- ID: ${c._id}, Name: ${c.name}, BusinessID: ${c.business_id}, Active: ${c.is_active}`
        );
      });
    } else {
      console.log("No categories found in 'categories' collection.");
      // Check singular 'category' just in case
      const singularCount = await db.collection('category').countDocuments();
      console.log(`Total Categories (singular 'category'): ${singularCount}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
