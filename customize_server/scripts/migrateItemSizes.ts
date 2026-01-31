import mongoose from 'mongoose';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ItemModel } from '../src/infrastructure/database/models/ItemModel';
import { ItemSizeModel } from '../src/infrastructure/database/models/ItemSizeModel';

/**
 * Migration script to convert embedded item sizes to separate ItemSize collection
 *
 * This script:
 * 1. Finds all items with embedded sizes
 * 2. Creates ItemSize documents for each embedded size
 * 3. Updates the item's default_size_id to point to the default size
 * 4. Removes the embedded sizes array from items
 *
 * Run with: npx ts-node scripts/migrateItemSizes.ts
 */

const migrateItemSizes = async (): Promise<void> => {
  try {
    console.log('🔄 Starting ItemSize migration...');

    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Find all items with embedded sizes
    const itemsWithSizes = await ItemModel.find({
      sizes: { $exists: true, $ne: [], $type: 'array' },
      'sizes.0': { $exists: true },
    });

    console.log(`📦 Found ${itemsWithSizes.length} items with embedded sizes`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const item of itemsWithSizes) {
      try {
        const itemId = item._id.toString();
        const embeddedSizes = (item as any).sizes || [];

        if (!embeddedSizes || embeddedSizes.length === 0) {
          console.log(`⚠️  Item ${itemId} has empty sizes array, skipping...`);
          continue;
        }

        // Create ItemSize documents for each embedded size
        const createdSizes: mongoose.Types.ObjectId[] = [];
        let defaultSizeId: mongoose.Types.ObjectId | null = null;

        for (let i = 0; i < embeddedSizes.length; i++) {
          const embeddedSize = embeddedSizes[i];

          // Generate code from name or use index-based code
          let code = embeddedSize.code;
          if (!code) {
            // Try to extract code from name (e.g., "Small (S)" -> "S")
            const codeMatch = embeddedSize.name?.match(/\(([A-Z]+)\)/i);
            code = codeMatch
              ? codeMatch[1].toUpperCase()
              : embeddedSize.name?.substring(0, 5).toUpperCase().trim() || `SIZE${i + 1}`;
          }

          // Ensure code is unique by checking existing sizes
          let uniqueCode = code;
          let suffix = 1;
          while (await ItemSizeModel.exists({ item_id: itemId, code: uniqueCode })) {
            uniqueCode = `${code}_${suffix}`;
            suffix++;
          }

          const itemSize = new ItemSizeModel({
            item_id: itemId,
            restaurant_id: (item as any).business_id,
            name: embeddedSize.name || `Size ${i + 1}`,
            code: uniqueCode,
            price: embeddedSize.price || 0,
            display_order: i,
            is_active: true,
          });

          const savedSize = await itemSize.save();
          createdSizes.push(savedSize._id);

          // Track default size
          if (embeddedSize.is_default === true) {
            defaultSizeId = savedSize._id;
          }
        }

        // If no size was marked as default, use the first one
        if (!defaultSizeId && createdSizes.length > 0) {
          defaultSizeId = createdSizes[0];
        }

        // Update item to remove embedded sizes and set default_size_id
        await ItemModel.updateOne(
          { _id: itemId },
          {
            $unset: { sizes: '' },
            $set: {
              default_size_id: defaultSizeId,
              is_sizeable: true, // Set is_sizeable to true if it has sizes
            },
          }
        );

        migratedCount++;
        console.log(
          `✅ Migrated item ${itemId}: Created ${createdSizes.length} sizes, default_size_id: ${defaultSizeId}`
        );
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error migrating item ${item._id}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log('🎉 Migration completed!');
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
};

// Run migration
if (require.main === module) {
  migrateItemSizes();
}

export default migrateItemSizes;
