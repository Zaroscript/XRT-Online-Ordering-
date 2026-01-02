import { connectDatabase } from '../src/infrastructure/database/connection';
import { ItemRepository } from '../src/infrastructure/repositories/ItemRepository';
import '../src/infrastructure/database/models/CategoryModel'; // Register model

const debugItems = async () => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        const repo = new ItemRepository();
        console.log('🧪 Testing findAll...');

        // Mock filters
        const result = await repo.findAll({ limit: 5, page: 1 });

        console.log(`Found ${result.items.length} items. Total: ${result.total}`);

        if (result.items.length > 0) {
            const firstItem = result.items[0];
            console.log('--- First Item Domain Object ---');
            console.log(JSON.stringify(firstItem, null, 2));

            if (firstItem.category) {
                console.log('✅ Category IS populated in Domain Object.');
            } else {
                console.log('❌ Category IS MISSING in Domain Object.');
            }

            if (firstItem.base_price !== undefined) {
                console.log('✅ Base Price is:', firstItem.base_price);
            } else {
                console.log('❌ Base Price IS MISSING.');
            }
        } else {
            console.log('❌ No items returned by findAll.');
        }

    } catch (error) {
        console.error('❌ Error debugging items:', error);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        process.exit(0);
    }
};

debugItems();
