import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { OrderModel } from '../src/infrastructure/database/models/OrderModel';
import { ItemModel } from '../src/infrastructure/database/models/ItemModel';
import { UserModel } from '../src/infrastructure/database/models/UserModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { ItemSizeModel } from '../src/infrastructure/database/models/ItemSizeModel';
import { ModifierModel } from '../src/infrastructure/database/models/ModifierModel';
import { Types } from 'mongoose';

const seedOrders = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    // 1. Get Business
    let business = await BusinessModel.findOne({ id: 'biz_001' });
    if (!business) {
      business = await BusinessModel.findOne();
    }
    if (!business) {
      console.error('❌ No business found. Please run seedBusinesses first.');
      process.exit(1);
    }
    console.log(`Using Business: ${business.name} (${business.id})`);

    // 2. Get/Create a test customer
    let customer = await UserModel.findOne({ email: 'test-customer@example.com' });
    if (!customer) {
      console.log('Creating test customer...');
      customer = new UserModel({
        name: 'Test Customer',
        email: 'test-customer@example.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
      });
      await customer.save();
    }
    console.log(`Using Customer: ${customer.name} (${customer._id})`);

    // 3. Get Items, Sizes, and Modifiers
    const items = await ItemModel.find({ is_active: true });
    const sizes = await ItemSizeModel.find({ deleted_at: null });
    const modifiers = await ModifierModel.find({ deleted_at: null });

    if (items.length === 0) {
      console.error('❌ No active items found. Please run seedItems first.');
      process.exit(1);
    }
    console.log(
      `Found ${items.length} items, ${sizes.length} sizes, and ${modifiers.length} modifiers.`
    );

    // 4. Clear existing orders
    console.log('🧹 Clearing existing orders...');
    await OrderModel.deleteMany({});

    // 5. Generate Orders
    const statuses = [
      'pending',
      'accepted',
      'inkitchen',
      'ready',
      'out of delivery',
      'completed',
      'canceled',
    ];
    const orders: any[] = [];
    const now = new Date();

    console.log('Generating 30 orders...');
    for (let i = 0; i < 30; i++) {
      try {
        const status = statuses[i % statuses.length];
        const orderType = Math.random() > 0.5 ? 'pickup' : 'delivery';
        const serviceTimeType = Math.random() > 0.5 ? 'Schedule' : 'ASAP';
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedItems: any[] = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const item = items[Math.floor(Math.random() * items.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;

          let unitPrice = Number(item.base_price) || 0;
          let sizeId: string | Types.ObjectId | undefined = undefined;
          let sizeSnap: string | undefined = undefined;

          // Handle Sizes
          if (item.is_sizeable && Array.isArray(item.sizes) && item.sizes.length > 0) {
            const validSizes = item.sizes.filter((s) => s && s.size_id);
            if (validSizes.length > 0) {
              const randomSizeRef = validSizes[Math.floor(Math.random() * validSizes.length)];
              sizeId = randomSizeRef.size_id;
              unitPrice = Number(randomSizeRef.price) || unitPrice;

              const sizeData = sizes.find(
                (s) => s && s._id && sizeId && s._id.toString() === sizeId.toString()
              );
              sizeSnap = sizeData ? sizeData.name : 'Selected Size';
            }
          }

          // Handle Modifiers
          const itemModifiers: any[] = [];
          let modifierTotals = 0;

          if (
            item.is_customizable &&
            Array.isArray(item.modifier_groups) &&
            item.modifier_groups.length > 0
          ) {
            const activeGroups = item.modifier_groups.filter((g) => g && g.modifier_group_id);
            const selectedGroups = activeGroups.slice(0, Math.min(activeGroups.length, 4));

            for (const group of selectedGroups) {
              const groupModifiers = modifiers.filter(
                (m) =>
                  m &&
                  m.modifier_group_id &&
                  m.modifier_group_id.toString() === group.modifier_group_id.toString()
              );
              if (groupModifiers.length > 0) {
                const mod = groupModifiers[Math.floor(Math.random() * groupModifiers.length)];
                const priceDelta = Number(mod.price) || 0;

                itemModifiers.push({
                  modifier_id: mod._id,
                  name_snapshot: mod.name || 'Extra',
                  unit_price_delta: priceDelta,
                });
                modifierTotals += priceDelta;
              }
            }
          }

          const itemUnitPriceWithModifiers = unitPrice + modifierTotals;
          const lineSubtotal = itemUnitPriceWithModifiers * quantity;

          selectedItems.push({
            menu_item_id: item._id,
            size_id: sizeId,
            name_snap: item.name || 'Unknown Item',
            size_snap: sizeSnap,
            unit_price: unitPrice,
            quantity: quantity,
            modifier_totals: modifierTotals,
            line_subtotal: lineSubtotal,
            modifiers: itemModifiers,
          });
          subtotal += lineSubtotal;
        }

        const taxRate = 0.08;
        const taxTotal = parseFloat((subtotal * taxRate).toFixed(2));
        const deliveryFee = orderType === 'delivery' ? 5.0 : 0;
        const totalAmount = subtotal + taxTotal + deliveryFee;

        const scheduleTime =
          serviceTimeType === 'Schedule'
            ? new Date(now.getTime() + (Math.floor(Math.random() * 24) + 1) * 3600000)
            : null;

        const order = {
          business_id: business._id,
          customer_id: customer._id,
          order_number: `ORD-${Date.now()}-${i}`,
          order_type: orderType,
          service_time_type: serviceTimeType,
          schedule_time: scheduleTime,
          status: status,
          money: {
            subtotal: subtotal,
            discount: 0,
            delivery_fee: deliveryFee,
            tax_total: taxTotal,
            tips: parseFloat((subtotal * (Math.random() * 0.15)).toFixed(2)),
            total_amount: totalAmount,
            currency: 'USD',
            payment: 'Cash',
          },
          delivery: {
            name: customer.name,
            phone: '555-1234',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip: '12345',
            },
          },
          items: selectedItems,
          created_at: new Date(now.getTime() - i * 3600000),
          updated_at: new Date(),
        };

        if (status === 'completed') {
          (order as any).completed_at = new Date();
        } else if (status === 'canceled') {
          (order as any).cancelled_at = new Date();
          (order as any).cancelled_reason = 'Testing cancellation';
          (order as any).cancelled_by = 'admin';
        }

        orders.push(order);
        console.log(`✅ Generated order ${i + 1}/15`);
      } catch (err: any) {
        console.error(`❌ Error generating order ${i + 1}:`, err.message);
      }
    }

    if (orders.length > 0) {
      console.log(`Seeding ${orders.length} enhanced orders...`);
      await OrderModel.insertMany(orders);
      console.log('🎉 Enhanced orders seeding completed!');
    } else {
      console.error('❌ No orders were generated.');
    }
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedOrders();

