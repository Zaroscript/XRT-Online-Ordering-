import mongoose from 'mongoose';
import { ItemModel } from './src/infrastructure/database/models/ItemModel';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const totalItems = await ItemModel.countDocuments({ is_active: true });
  const topHalfCount = Math.ceil(totalItems / 2);
  const bottomHalfCount = totalItems - topHalfCount;

  console.log(`Total items: ${totalItems}, Top half: ${topHalfCount}, Bottom half: ${bottomHalfCount}`);

  const sharedPipeline = [
    { $match: { is_active: true } },
    {
      $lookup: {
        from: 'orders',
        let: { itemId: '$_id' },
        pipeline: [
          { $match: { status: 'completed' } },
          { $unwind: '$items' },
          { $match: { $expr: { $eq: ['$items.menu_item_id', '$$itemId'] } } }
        ],
        as: 'orderItems'
      }
    },
    {
      $project: {
        name: 1,
        orders_count: { $sum: '$orderItems.items.quantity' }
      }
    },
    { $sort: { orders_count: -1 } },
  ];

  const allRanked = await ItemModel.aggregate(sharedPipeline as any);
  console.log('\nALL ITEMS RANKED:', allRanked.map((x: any) => `${x.name} (${x.orders_count})`));

  const mostSold = allRanked.slice(0, topHalfCount);
  const lessSold = allRanked.slice(topHalfCount);

  console.log('\n✅ MOST SOLD (top half):', mostSold.map((x: any) => `${x.name} (${x.orders_count})`));
  console.log('✅ LESS SOLD (bottom half):', lessSold.map((x: any) => `${x.name} (${x.orders_count})`));

  // Check overlap
  const mostSoldIds = new Set(mostSold.map((x: any) => x._id.toString()));
  const overlap = lessSold.filter((x: any) => mostSoldIds.has(x._id.toString()));
  console.log('\n🔍 Overlap count:', overlap.length, overlap.length === 0 ? '✅ No overlap!' : '❌ OVERLAP DETECTED!');

  process.exit(0);
}
run();
