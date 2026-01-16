import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ModifierGroupModel } from '../src/infrastructure/database/models/ModifierGroupModel';
import { ModifierModel } from '../src/infrastructure/database/models/ModifierModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { Types } from 'mongoose';

const seedModifiers = async (): Promise<void> => {
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

        // 2. Clear existing data
        console.log('🧹 Clearing existing modifiers and groups...');
        await ModifierModel.deleteMany({});
        await ModifierGroupModel.deleteMany({ business_id: businessId });

        // 3a. Create Global Sizes
        console.log('Creating global item sizes...');
        const { ItemSizeModel } = await import('../src/infrastructure/database/models/ItemSizeModel'); // Dynamic import to ensure DB connection

        await ItemSizeModel.deleteMany({ business_id: businessId });

        const sizeDocs = await ItemSizeModel.insertMany([
            { business_id: businessId, name: 'Small', code: 'S', display_order: 1, is_active: true },
            { business_id: businessId, name: 'Medium', code: 'M', display_order: 2, is_active: true },
            { business_id: businessId, name: 'Large', code: 'L', display_order: 3, is_active: true },
            { business_id: businessId, name: 'Extra Large', code: 'XL', display_order: 4, is_active: true },
        ]);

        const sizeMap = sizeDocs.reduce((acc: any, size: any) => {
            acc[size.code] = size._id;
            return acc;
        }, {});

        console.log('✅ Created global sizes:', Object.keys(sizeMap));

        // 3b. Define and Create Modifier Groups with comprehensive configurations
        const groupsData = [
            {
                name: 'Size Options',
                display_type: 'RADIO',
                min_select: 1,
                max_select: 1,
                applies_per_quantity: false,
                sort_order: 1,
                is_active: true,
                quantity_levels: [
                    {
                        quantity: 1,
                        name: 'Standard',
                        price: 0,
                        is_active: true,
                        is_default: true,
                        display_order: 1,
                        prices_by_size: [
                            { size_id: sizeMap['S'], priceDelta: 0 },
                            { size_id: sizeMap['M'], priceDelta: 2.00 },
                            { size_id: sizeMap['L'], priceDelta: 4.00 },
                            { size_id: sizeMap['XL'], priceDelta: 6.00 }
                        ]
                    }
                ]
            },
            {
                name: 'Sauce Selection',
                display_type: 'CHECKBOX',
                min_select: 0,
                max_select: 3,
                applies_per_quantity: false,
                sort_order: 2,
                is_active: true,
                quantity_levels: [] // Free sauces, no pricing
            },
            {
                name: 'Extra Toppings',
                display_type: 'CHECKBOX',
                min_select: 0,
                max_select: 5,
                applies_per_quantity: true,
                sort_order: 3,
                is_active: true,
                quantity_levels: [
                    {
                        quantity: 1,
                        name: 'Standard',
                        price: 1.50,
                        is_active: true,
                        is_default: true,
                        display_order: 1,
                        prices_by_size: []
                    },
                    {
                        quantity: 2,
                        name: 'Double',
                        price: 2.75,
                        is_active: true,
                        is_default: false,
                        display_order: 2,
                        prices_by_size: []
                    }
                ]
            },
            {
                name: 'Spice Level',
                display_type: 'RADIO',
                min_select: 1,
                max_select: 1,
                applies_per_quantity: false,
                sort_order: 4,
                is_active: true,
                quantity_levels: [] // No pricing, just selection
            },
            {
                name: 'Beverage Size',
                display_type: 'RADIO',
                min_select: 1,
                max_select: 1,
                applies_per_quantity: false,
                sort_order: 5,
                is_active: true,
                quantity_levels: [
                    {
                        quantity: 1,
                        name: 'Standard',
                        price: 0,
                        is_active: true,
                        is_default: true,
                        display_order: 1,
                        prices_by_size: [
                            { size_id: sizeMap['S'], priceDelta: 0 },
                            { size_id: sizeMap['M'], priceDelta: 1.00 },
                            { size_id: sizeMap['L'], priceDelta: 2.00 },
                            { size_id: sizeMap['XL'], priceDelta: 3.00 }
                        ]
                    }
                ]
            }
        ];

        console.log('Creating modifier groups...');
        const createdGroups = [];

        for (const groupData of groupsData) {
            const group = await ModifierGroupModel.create({
                business_id: businessId,
                ...groupData
            });
            createdGroups.push(group);
        }

        console.log(`✅ Created ${createdGroups.length} modifier groups.`);

        // 4. Create Modifiers for each Group with modifier-level configurations
        console.log('Creating modifiers...');
        const modifiers = [];

        // Size Options - modifiers inherit group pricing
        const sizeGroup = createdGroups.find(g => g.name === 'Size Options');
        if (sizeGroup) {
            modifiers.push(
                { 
                    modifier_group_id: sizeGroup._id, 
                    name: 'Small', 
                    is_default: false, 
                    display_order: 1,
                    // No modifier-level override - uses group defaults
                },
                { 
                    modifier_group_id: sizeGroup._id, 
                    name: 'Medium', 
                    is_default: true, 
                    display_order: 2,
                    // No modifier-level override - uses group defaults
                },
                { 
                    modifier_group_id: sizeGroup._id, 
                    name: 'Large', 
                    is_default: false, 
                    display_order: 3,
                    // Example: Modifier-level override with custom pricing
                    quantity_levels: [
                        {
                            quantity: 1,
                            name: 'Standard',
                            price: 0,
                            is_active: true,
                            is_default: true,
                            display_order: 1,
                            prices_by_size: [
                                { size_id: sizeMap['S'], priceDelta: 0 },
                                { size_id: sizeMap['M'], priceDelta: 2.50 }, // Override: +$2.50 instead of +$2.00
                                { size_id: sizeMap['L'], priceDelta: 5.00 }  // Override: +$5.00 instead of +$4.00
                            ]
                        }
                    ]
                }
            );
        }

        // Sauce Selection - free sauces, no pricing
        const sauceGroup = createdGroups.find(g => g.name === 'Sauce Selection');
        if (sauceGroup) {
            modifiers.push(
                { modifier_group_id: sauceGroup._id, name: 'Ketchup', display_order: 1 },
                { modifier_group_id: sauceGroup._id, name: 'Mayo', display_order: 2 },
                { modifier_group_id: sauceGroup._id, name: 'Mustard', display_order: 3 },
                { modifier_group_id: sauceGroup._id, name: 'BBQ Sauce', display_order: 4 },
                { modifier_group_id: sauceGroup._id, name: 'Hot Sauce', display_order: 5 }
            );
        }

        // Extra Toppings - modifiers with individual pricing overrides
        const toppingGroup = createdGroups.find(g => g.name === 'Extra Toppings');
        if (toppingGroup) {
            modifiers.push(
                { 
                    modifier_group_id: toppingGroup._id, 
                    name: 'Cheese', 
                    display_order: 1,
                    // Uses group default pricing (quantity_levels from group)
                },
                { 
                    modifier_group_id: toppingGroup._id, 
                    name: 'Bacon', 
                    display_order: 2,
                    // Modifier-level override: Premium pricing
                    quantity_levels: [
                        {
                            quantity: 1,
                            name: 'Standard',
                            price: 2.50, // Override: $2.50 instead of group's $1.50
                            is_active: true,
                            is_default: true,
                            display_order: 1,
                            prices_by_size: []
                        }
                    ]
                },
                { 
                    modifier_group_id: toppingGroup._id, 
                    name: 'Mushrooms', 
                    display_order: 3,
                    // Uses group default pricing
                },
                { 
                    modifier_group_id: toppingGroup._id, 
                    name: 'Onions', 
                    display_order: 4,
                    // Modifier-level override: Discounted pricing
                    quantity_levels: [
                        {
                            quantity: 1,
                            name: 'Standard',
                            price: 0.75, // Override: $0.75 instead of group's $1.50
                            is_active: true,
                            is_default: true,
                            display_order: 1,
                            prices_by_size: []
                        }
                    ]
                }
            );
        }

        // Spice Level - no pricing, just selection
        const spiceGroup = createdGroups.find(g => g.name === 'Spice Level');
        if (spiceGroup) {
            modifiers.push(
                { modifier_group_id: spiceGroup._id, name: 'Mild', is_default: true, display_order: 1 },
                { modifier_group_id: spiceGroup._id, name: 'Medium', display_order: 2 },
                { modifier_group_id: spiceGroup._id, name: 'Hot', display_order: 3 },
                { modifier_group_id: spiceGroup._id, name: 'Extra Hot', display_order: 4 }
            );
        }

        // Beverage Size - modifiers inherit group pricing
        const beverageGroup = createdGroups.find(g => g.name === 'Beverage Size');
        if (beverageGroup) {
            modifiers.push(
                { modifier_group_id: beverageGroup._id, name: 'Small', is_default: false, display_order: 1 },
                { modifier_group_id: beverageGroup._id, name: 'Medium', is_default: true, display_order: 2 },
                { modifier_group_id: beverageGroup._id, name: 'Large', is_default: false, display_order: 3 },
                { modifier_group_id: beverageGroup._id, name: 'Extra Large', is_default: false, display_order: 4 }
            );
        }

        await ModifierModel.insertMany(modifiers);
        console.log(`✅ Created ${modifiers.length} modifiers.`);

        console.log('🎉 Modifiers seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding modifiers:', error);
        process.exit(1);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedModifiers();
