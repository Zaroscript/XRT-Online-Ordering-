import mongoose from 'mongoose';
import { ItemModel } from './src/infrastructure/database/models/ItemModel';

import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const popularItems = await ItemModel.aggregate([
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
        id: '$_id',
        name: 1,
        orders_count: { $sum: '$orderItems.items.quantity' }
      }
    },
    { $sort: { orders_count: -1 } },
    { $limit: 3 }
  ]);
  console.log("POPULAR:");
  console.log(JSON.stringify(popularItems, null, 2));

  const lessSoldItems = await ItemModel.aggregate([
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
        id: '$_id',
        name: 1,
        orders_count: { $sum: '$orderItems.items.quantity' }
      }
    },
    { $sort: { orders_count: 1 } },
    { $limit: 3 }
  ]);
  console.log("LESS SOLD:");
  console.log(JSON.stringify(lessSoldItems, null, 2));
  
  process.exit(0);
}
run();
