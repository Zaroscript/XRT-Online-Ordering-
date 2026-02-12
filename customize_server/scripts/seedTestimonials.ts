import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { TestimonialModel } from '../src/infrastructure/database/models/TestimonialModel';

const testimonials = [
  {
    name: 'Ahmed Al-Rashid',
    feedback:
      'XRT transformed our gym store operations. The online ordering system is seamless, inventory management is effortless, and our sales have grown 40% since switching.',
    image: '',
    role: 'CEO, FitZone Athletics',
    is_active: true,
  },
  {
    name: 'Sarah Mitchell',
    feedback:
      'As a fitness brand owner, I needed a platform that reflects the energy of our products. XRT delivered beyond expectations — fast, beautiful, and easy to manage.',
    image: '',
    role: 'Founder, IronWear Co.',
    is_active: true,
  },
  {
    name: 'Omar Khalil',
    feedback:
      'The admin dashboard gives me full control over products, coupons, and customer data. Customer support is outstanding — they respond within minutes!',
    image: '',
    role: 'Operations Manager, PowerFit Gear',
    is_active: true,
  },
  {
    name: 'Jessica Wang',
    feedback:
      'We switched from Shopify to XRT and never looked back. The customization options are incredible and the performance is blazing fast.',
    image: '',
    role: 'E-Commerce Director, FlexApparel',
    is_active: true,
  },
  {
    name: 'Khalid Mansour',
    feedback:
      'Our customers love the new ordering experience. The mobile-first design and quick checkout flow reduced cart abandonment by 25%.',
    image: '',
    role: 'Owner, StrengthWear UAE',
    is_active: true,
  },
];

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('🔌 Connected to database');

    const count = await TestimonialModel.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  ${count} testimonials already exist. Skipping seed to avoid duplicates.`);
      console.log('   To re-seed, delete existing testimonials first.');
    } else {
      console.log('Creating testimonials...');
      for (const item of testimonials) {
        const doc = new TestimonialModel(item);
        await doc.save();
        console.log(`✅ Created testimonial: ${doc.name} — ${doc.role}`);
      }
      console.log(`🎉 Seeded ${testimonials.length} testimonials!`);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();
