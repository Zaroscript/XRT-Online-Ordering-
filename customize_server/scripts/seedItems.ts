import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ItemModel } from '../src/infrastructure/database/models/ItemModel';
import { CategoryModel } from '../src/infrastructure/database/models/CategoryModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { ModifierGroupModel } from '../src/infrastructure/database/models/ModifierGroupModel';
import { ModifierModel } from '../src/infrastructure/database/models/ModifierModel';
import { ItemSizeModel } from '../src/infrastructure/database/models/ItemSizeModel';
import { Types } from 'mongoose';

const seedItems = async (): Promise<void> => {
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

        const businessId = business.id;
        console.log(`Using Business ID: ${businessId}`);

        // 2. Get Categories
        const categories = await CategoryModel.find({ business_id: businessId });
        if (categories.length === 0) {
            console.error('❌ No categories found. Please run seedCategories first.');
            process.exit(1);
        }

        console.log(`Found ${categories.length} categories.`);

        // 2b. Get Modifier Groups and Modifiers
        const modifierGroups = await ModifierGroupModel.find({ business_id: businessId, deleted_at: null });
        const modifiers = await ModifierModel.find({ deleted_at: null });
        const itemSizes = await ItemSizeModel.find({ business_id: businessId, is_active: true });

        console.log(`Found ${modifierGroups.length} modifier groups and ${modifiers.length} modifiers.`);
        console.log(`Found ${itemSizes.length} item sizes.`);

        // 3. Clear existing items
        console.log('🧹 Clearing existing items...');
        await ItemModel.deleteMany({ business_id: businessId });

        // 4. Generate Items with modifier groups and overrides
        const items = [];
        const adjectives = ['Spicy', 'Sweet', 'Savory', 'Crispy', 'Fresh', 'Grilled', 'Roasted', 'Steamed', 'Fried', 'Baked'];
        const nouns = ['Burger', 'Pizza', 'Salad', 'Pasta', 'Soup', 'Sandwich', 'Wrap', 'Taco', 'Sushi', 'Steak'];
        
        // Create a few specific items with modifier groups to demonstrate the override hierarchy
        const specificItems = [
            {
                name: 'Classic Burger',
                description: 'A classic burger with customizable options',
                category: categories.find(c => c.name === 'Burgers') || categories[0],
                is_sizeable: true,
                base_price: 0,
                modifier_groups: modifierGroups.filter(g => ['Size Options', 'Sauce Selection', 'Extra Toppings'].includes(g.name)),
            },
            {
                name: 'Premium Pizza',
                description: 'Premium pizza with size and topping options',
                category: categories.find(c => c.name === 'Main Course') || categories[0],
                is_sizeable: true,
                base_price: 0,
                modifier_groups: modifierGroups.filter(g => ['Size Options', 'Extra Toppings', 'Spice Level'].includes(g.name)),
            },
            {
                name: 'Fresh Salad',
                description: 'Fresh salad with dressing options',
                category: categories.find(c => c.name === 'Salads') || categories[0],
                is_sizeable: false,
                base_price: 8.99,
                modifier_groups: modifierGroups.filter(g => ['Sauce Selection'].includes(g.name)),
            },
        ];

        // Add specific items with modifier groups
        for (let i = 0; i < specificItems.length; i++) {
            const specItem = specificItems[i];
            const item: any = {
                business_id: businessId,
                category_id: specItem.category._id,
                name: specItem.name,
                description: specItem.description,
                is_active: true,
                is_available: true,
                is_signature: i === 0, // First item is signature
                is_sizeable: specItem.is_sizeable,
                is_customizable: true,
                image: 'https://placehold.co/400x300',
                sort_order: i,
                max_per_order: 10,
                base_price: specItem.base_price,
                sizes: [],
            };

            // Add sizes if sizeable
            if (specItem.is_sizeable && itemSizes.length > 0) {
                const defaultSize = itemSizes.find(s => s.code === 'M') || itemSizes[0];
                item.default_size_id = defaultSize._id;
            }

            // Add modifier groups with item-level overrides
            if (specItem.modifier_groups.length > 0) {
                item.modifier_groups = specItem.modifier_groups.map((group: any, index: number) => {
                    const groupModifiers = modifiers.filter(m => 
                        m.modifier_group_id.toString() === group._id.toString()
                    );

                    // For the first item, add item-level overrides to demonstrate the hierarchy
                    const modifierOverrides: any[] = [];
                    if (i === 0 && groupModifiers.length > 0) {
                        // Example: Override pricing for "Bacon" modifier in "Extra Toppings" group
                        const baconModifier = groupModifiers.find((m: any) => m.name === 'Bacon');
                        if (baconModifier && group.name === 'Extra Toppings') {
                            modifierOverrides.push({
                                modifier_id: baconModifier._id,
                                max_quantity: 3, // Item-level override: max 3 instead of modifier default
                                is_default: false,
                                prices_by_size: itemSizes.map((size: any) => ({
                                    sizeCode: size.code,
                                    priceDelta: size.code === 'L' ? 3.00 : 2.50, // Item-level price override
                                })),
                            });
                        }
                    }

                    return {
                        modifier_group_id: group._id,
                        display_order: index + 1,
                        modifier_overrides: modifierOverrides.length > 0 ? modifierOverrides : undefined,
                    };
                });
            }

            items.push(item);
        }

        // Generate additional random items
        for (let i = specificItems.length; i < 20; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

            const is_active = Math.random() > 0.3; // 70% chance of being active
            const is_available = Math.random() > 0.2; // 80% chance of being available
            const is_sizeable = Math.random() > 0.6; // 40% chance of being sizeable
            const is_customizable = Math.random() > 0.7; // 30% chance of being customizable

            const item: any = {
                business_id: businessId,
                category_id: randomCategory._id,
                name: `${randomAdjective} ${randomNoun} ${i + 1}`,
                description: `A delicious ${randomAdjective.toLowerCase()} ${randomNoun.toLowerCase()} made with fresh ingredients.`,
                is_active: is_active,
                is_available: is_available,
                is_signature: Math.random() > 0.8, // 20% chance of being signature
                is_sizeable: is_sizeable,
                is_customizable: is_customizable,
                image: 'https://placehold.co/400x300',
                sort_order: i,
                max_per_order: Math.floor(Math.random() * 10) + 1,
            };

            if (is_sizeable && itemSizes.length > 0) {
                const defaultSize = itemSizes[Math.floor(Math.random() * itemSizes.length)];
                item.default_size_id = defaultSize._id;
                item.base_price = 0;
            } else {
                item.base_price = parseFloat((Math.random() * 20 + 5).toFixed(2));
            }

            // Randomly assign modifier groups to some items
            if (is_customizable && modifierGroups.length > 0 && Math.random() > 0.5) {
                const numGroups = Math.floor(Math.random() * 3) + 1;
                const selectedGroups = modifierGroups
                    .sort(() => Math.random() - 0.5)
                    .slice(0, numGroups);
                
                item.modifier_groups = selectedGroups.map((group: any, index: number) => ({
                    modifier_group_id: group._id,
                    display_order: index + 1,
                }));
            }

            items.push(item);
        }

        // 5. Insert Items
        console.log(`Seeding ${items.length} items...`);
        await ItemModel.insertMany(items);
        console.log('🎉 Items seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding items:', error);
        process.exit(1);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedItems();
