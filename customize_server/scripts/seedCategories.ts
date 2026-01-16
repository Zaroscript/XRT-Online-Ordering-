import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { CategoryModel } from '../src/infrastructure/database/models/CategoryModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { UserModel } from '../src/infrastructure/database/models/UserModel';

const seedCategories = async (): Promise<void> => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        // 1. Get a Business ID
        let business = await BusinessModel.findOne({ id: 'biz_001' });

        if (!business) {
            console.log('⚠️ Business biz_001 not found. Looking for any business...');
            business = await BusinessModel.findOne();
        }

        if (!business) {
            console.log('⚠️ No business found. Creating a dummy business...');
            // Ensure owner exists
            let owner = await UserModel.findOne({ email: 'owner@example.com' });
            if (!owner) {
                owner = await UserModel.findOne();
            }
            if (!owner) {
                console.error('❌ No user found to be owner. Run seedSuperAdmin or seedBusinesses first.');
                process.exit(1);
            }

            business = await BusinessModel.create({
                id: 'biz_001',
                owner: owner._id,
                name: 'Gourmet Burger Kitchen',
                legal_name: 'GBK Ltd',
                primary_content_name: 'John Doe',
                primary_content_email: 'john@gbk.com',
                primary_content_phone: '1234567890',
                description: 'Best burgers in town',
                isActive: true,
            });
            console.log('✅ Created dummy business biz_001');
        }

        const businessId = business.id;
        console.log(`Using Business ID: ${businessId}`);

        // 2. Define Categories
        // Note: Icons should be uploaded through the admin interface or use valid Cloudinary URLs
        const categories = [
            {
                business_id: businessId,
                name: 'Appetizers',
                description: 'Starters to get you going',
                kitchen_section_id: 'KS_001',
                sort_order: 1,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Main Course',
                description: 'Hearty meals and signature dishes',
                kitchen_section_id: 'KS_002',
                sort_order: 2,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Burgers',
                description: 'Our famous gourmet burgers',
                kitchen_section_id: 'KS_002',
                sort_order: 3,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Pizza',
                description: 'Freshly baked pizzas with premium toppings',
                kitchen_section_id: 'KS_002',
                sort_order: 4,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Salads',
                description: 'Fresh and healthy greens',
                kitchen_section_id: 'KS_001',
                sort_order: 5,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Desserts',
                description: 'Sweet treats to end your meal',
                kitchen_section_id: 'KS_003',
                sort_order: 6,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Beverages',
                description: 'Refreshing hot and cold drinks',
                kitchen_section_id: 'KS_004',
                sort_order: 7,
                is_active: true,
                image: 'https://placehold.co/150',
            },
            {
                business_id: businessId,
                name: 'Sides',
                description: 'Perfect accompaniments to your meal',
                kitchen_section_id: 'KS_001',
                sort_order: 8,
                is_active: true,
                image: 'https://placehold.co/150',
            }
        ];

        // 3. Clear existing categories for this business to ensure a clean state
        console.log(`🧹 Clearing existing categories for business ${businessId}...`);
        await CategoryModel.deleteMany({ business_id: businessId });

        // 4. Insert Categories
        console.log('Seeding categories...');
        for (const catData of categories) {
            const exists = await CategoryModel.findOne({ name: catData.name, business_id: businessId });
            if (!exists) {
                await CategoryModel.create(catData);
                console.log(`✅ Created category: ${catData.name}`);
            } else {
                console.log(`ℹ️ Category already exists: ${catData.name}`);

                // Update fields if they differ
                let hasChanges = false;

                if (exists.description !== catData.description) {
                    exists.description = catData.description;
                    hasChanges = true;
                }

                if (exists.kitchen_section_id !== catData.kitchen_section_id) {
                    exists.kitchen_section_id = catData.kitchen_section_id;
                    hasChanges = true;
                }

                if (exists.sort_order !== catData.sort_order) {
                    exists.sort_order = catData.sort_order;
                    hasChanges = true;
                }

                if (exists.is_active !== catData.is_active) {
                    exists.is_active = catData.is_active;
                    hasChanges = true;
                }

                // Force update if it's an invalid Cloudinary placeholder
                if (exists.image && exists.image.includes('placeholder_')) {
                    exists.image = catData.image;
                    hasChanges = true;
                }

                // Only update image/icon if they are currently null/empty
                if (!exists.image && catData.image) {
                    exists.image = catData.image;
                    hasChanges = true;
                }

                // if (!exists.icon && catData.icon) {
                //     exists.icon = catData.icon;
                //     hasChanges = true;
                // }

                if (hasChanges) {
                    await exists.save();
                    console.log(`   Updated ${catData.name}`);
                }
            }
        }

        console.log('🎉 Category seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedCategories();
