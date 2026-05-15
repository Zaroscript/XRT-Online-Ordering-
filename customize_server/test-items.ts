import mongoose from 'mongoose';
import { ItemModel } from './src/infrastructure/database/models/ItemModel';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const allItems = await ItemModel.find({ is_active: true }, 'name');
  console.log("ALL ITEMS:", allItems.length);
  console.log(allItems.map(i => i.name));
  
  process.exit(0);
}
run();
