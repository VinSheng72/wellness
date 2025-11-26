import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('🌱 Starting database seed...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get models
    const UserModel = app.get(getModelToken('User'));
    const CompanyModel = app.get(getModelToken('Company'));
    const VendorModel = app.get(getModelToken('Vendor'));
    const EventItemModel = app.get(getModelToken('EventItem'));
    const EventModel = app.get(getModelToken('Event'));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await UserModel.deleteMany({});
    await CompanyModel.deleteMany({});
    await VendorModel.deleteMany({});
    await EventItemModel.deleteMany({});
    await EventModel.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Companies
    console.log('🏢 Seeding companies...');
    const companies = await CompanyModel.insertMany([
      {
        name: 'Tech Innovations Inc',
        address: '123 Tech Street, Singapore 123456',
        contactEmail: 'hr@techinnovations.com',
        contactPhone: '+65 6123 4567',
      },
      {
        name: 'Global Solutions Pte Ltd',
        address: '456 Business Avenue, Singapore 654321',
        contactEmail: 'contact@globalsolutions.com',
        contactPhone: '+65 6234 5678',
      },
      {
        name: 'Creative Minds Co',
        address: '789 Innovation Drive, Singapore 789012',
        contactEmail: 'info@creativeminds.com',
        contactPhone: '+65 6345 6789',
      },
    ]);
    console.log(`✅ Created ${companies.length} companies\n`);

    // Seed Vendors
    console.log('🏪 Seeding vendors...');
    const vendors = await VendorModel.insertMany([
      {
        name: 'Wellness Spa & Massage',
        description: 'Premium spa and massage services for corporate wellness',
        contactEmail: 'bookings@wellnessspa.com',
        contactPhone: '+65 6456 7890',
        address: '100 Wellness Road, Singapore 100100',
      },
      {
        name: 'Fitness First Corporate',
        description: 'Corporate fitness programs and gym memberships',
        contactEmail: 'corporate@fitnessfirst.com',
        contactPhone: '+65 6567 8901',
        address: '200 Fitness Lane, Singapore 200200',
      },
      {
        name: 'Mindful Yoga Studio',
        description: 'Yoga and mindfulness sessions for workplace wellness',
        contactEmail: 'hello@mindfulyoga.com',
        contactPhone: '+65 6678 9012',
        address: '300 Zen Street, Singapore 300300',
      },
      {
        name: 'Healthy Eats Catering',
        description: 'Nutritious meal plans and healthy catering services',
        contactEmail: 'orders@healthyeats.com',
        contactPhone: '+65 6789 0123',
        address: '400 Food Court, Singapore 400400',
      },
    ]);
    console.log(`✅ Created ${vendors.length} vendors\n`);

    // Seed Event Items
    console.log('🎯 Seeding event items...');
    const eventItems = await EventItemModel.insertMany([
      // Wellness Spa & Massage items
      {
        name: 'Full Body Massage Session',
        description: '60-minute relaxing full body massage for employees',
        vendorId: vendors[0]._id,
        category: 'Massage',
        price: 120,
        duration: 60,
      },
      {
        name: 'Chair Massage Package',
        description: '15-minute chair massage sessions for office',
        vendorId: vendors[0]._id,
        category: 'Massage',
        price: 40,
        duration: 15,
      },
      {
        name: 'Aromatherapy Session',
        description: 'Relaxing aromatherapy treatment',
        vendorId: vendors[0]._id,
        category: 'Spa',
        price: 90,
        duration: 45,
      },
      // Fitness First Corporate items
      {
        name: 'Group Fitness Class',
        description: 'High-energy group fitness session',
        vendorId: vendors[1]._id,
        category: 'Fitness',
        price: 150,
        duration: 60,
      },
      {
        name: 'Personal Training Session',
        description: 'One-on-one personal training',
        vendorId: vendors[1]._id,
        category: 'Fitness',
        price: 200,
        duration: 60,
      },
      {
        name: 'Corporate Gym Membership',
        description: 'Monthly gym membership for employees',
        vendorId: vendors[1]._id,
        category: 'Membership',
        price: 80,
        duration: 0,
      },
      // Mindful Yoga Studio items
      {
        name: 'Office Yoga Session',
        description: 'Yoga session conducted at your office',
        vendorId: vendors[2]._id,
        category: 'Yoga',
        price: 180,
        duration: 60,
      },
      {
        name: 'Meditation Workshop',
        description: 'Guided meditation and mindfulness workshop',
        vendorId: vendors[2]._id,
        category: 'Mindfulness',
        price: 150,
        duration: 90,
      },
      {
        name: 'Stress Management Class',
        description: 'Learn techniques to manage workplace stress',
        vendorId: vendors[2]._id,
        category: 'Wellness',
        price: 120,
        duration: 60,
      },
      // Healthy Eats Catering items
      {
        name: 'Healthy Lunch Catering',
        description: 'Nutritious lunch for team events',
        vendorId: vendors[3]._id,
        category: 'Catering',
        price: 25,
        duration: 0,
      },
      {
        name: 'Nutrition Workshop',
        description: 'Educational workshop on healthy eating',
        vendorId: vendors[3]._id,
        category: 'Workshop',
        price: 200,
        duration: 120,
      },
      {
        name: 'Smoothie Bar Setup',
        description: 'Fresh smoothie bar for office events',
        vendorId: vendors[3]._id,
        category: 'Catering',
        price: 300,
        duration: 180,
      },
    ]);
    console.log(`✅ Created ${eventItems.length} event items\n`);

    // Seed Users (with hashed passwords)
    console.log('👥 Seeding users...');
    const salt = await bcrypt.genSalt(10);
    
    const users = await UserModel.insertMany([
      // HR Admins
      {
        username: 'hr_tech',
        password: await bcrypt.hash('password123', salt),
        role: 'HR_ADMIN',
        companyId: companies[0]._id,
      },
      {
        username: 'hr_global',
        password: await bcrypt.hash('password123', salt),
        role: 'HR_ADMIN',
        companyId: companies[1]._id,
      },
      {
        username: 'hr_creative',
        password: await bcrypt.hash('password123', salt),
        role: 'HR_ADMIN',
        companyId: companies[2]._id,
      },
      // Vendor Admins
      {
        username: 'vendor_spa',
        password: await bcrypt.hash('password123', salt),
        role: 'VENDOR_ADMIN',
        vendorId: vendors[0]._id,
      },
      {
        username: 'vendor_fitness',
        password: await bcrypt.hash('password123', salt),
        role: 'VENDOR_ADMIN',
        vendorId: vendors[1]._id,
      },
      {
        username: 'vendor_yoga',
        password: await bcrypt.hash('password123', salt),
        role: 'VENDOR_ADMIN',
        vendorId: vendors[2]._id,
      },
      {
        username: 'vendor_catering',
        password: await bcrypt.hash('password123', salt),
        role: 'VENDOR_ADMIN',
        vendorId: vendors[3]._id,
      },
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // Seed Sample Events
    console.log('📅 Seeding sample events...');
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const futureDate3 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days from now
    const futureDate4 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const futureDate5 = new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000); // 17 days from now
    const futureDate6 = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000); // 24 days from now

    const events = await EventModel.insertMany([
      // Pending events
      {
        companyId: companies[0]._id,
        eventItemId: eventItems[0]._id, // Full Body Massage
        vendorId: vendors[0]._id,
        proposedDates: [futureDate1, futureDate2, futureDate3],
        location: {
          postalCode: '123456',
          streetName: 'Tech Street',
        },
        status: 'Pending',
        dateCreated: new Date(),
        lastModified: new Date(),
      },
      {
        companyId: companies[1]._id,
        eventItemId: eventItems[6]._id, // Office Yoga Session
        vendorId: vendors[2]._id,
        proposedDates: [futureDate4, futureDate5, futureDate6],
        location: {
          postalCode: '654321',
          streetName: 'Business Avenue',
        },
        status: 'Pending',
        dateCreated: new Date(),
        lastModified: new Date(),
      },
      // Approved event
      {
        companyId: companies[0]._id,
        eventItemId: eventItems[3]._id, // Group Fitness Class
        vendorId: vendors[1]._id,
        proposedDates: [futureDate1, futureDate2, futureDate3],
        location: {
          postalCode: '123456',
          streetName: 'Tech Street',
        },
        status: 'Approved',
        confirmedDate: futureDate2,
        dateCreated: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastModified: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      // Rejected event
      {
        companyId: companies[2]._id,
        eventItemId: eventItems[9]._id, // Healthy Lunch Catering
        vendorId: vendors[3]._id,
        proposedDates: [futureDate1, futureDate2, futureDate3],
        location: {
          postalCode: '789012',
          streetName: 'Innovation Drive',
        },
        status: 'Rejected',
        remarks: 'Unable to accommodate due to high demand during proposed dates',
        dateCreated: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        lastModified: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      // More pending events for variety
      {
        companyId: companies[1]._id,
        eventItemId: eventItems[10]._id, // Nutrition Workshop
        vendorId: vendors[3]._id,
        proposedDates: [futureDate4, futureDate5, futureDate6],
        location: {
          postalCode: '654321',
          streetName: 'Business Avenue',
        },
        status: 'Pending',
        dateCreated: new Date(),
        lastModified: new Date(),
      },
      {
        companyId: companies[2]._id,
        eventItemId: eventItems[7]._id, // Meditation Workshop
        vendorId: vendors[2]._id,
        proposedDates: [futureDate1, futureDate2, futureDate3],
        location: {
          postalCode: '789012',
          streetName: 'Innovation Drive',
        },
        status: 'Pending',
        dateCreated: new Date(),
        lastModified: new Date(),
      },
    ]);
    console.log(`✅ Created ${events.length} sample events\n`);

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📋 Seed Summary:');
    console.log('================');
    console.log(`Companies: ${companies.length}`);
    console.log(`Vendors: ${vendors.length}`);
    console.log(`Event Items: ${eventItems.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Events: ${events.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('===================');
    console.log('\nHR Admin Accounts:');
    console.log('  Username: hr_tech       | Password: password123 | Company: Tech Innovations Inc');
    console.log('  Username: hr_global     | Password: password123 | Company: Global Solutions Pte Ltd');
    console.log('  Username: hr_creative   | Password: password123 | Company: Creative Minds Co');
    console.log('\nVendor Admin Accounts:');
    console.log('  Username: vendor_spa       | Password: password123 | Vendor: Wellness Spa & Massage');
    console.log('  Username: vendor_fitness   | Password: password123 | Vendor: Fitness First Corporate');
    console.log('  Username: vendor_yoga      | Password: password123 | Vendor: Mindful Yoga Studio');
    console.log('  Username: vendor_catering  | Password: password123 | Vendor: Healthy Eats Catering');
    console.log('\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
