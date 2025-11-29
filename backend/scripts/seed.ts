import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('🌱 Starting database seed...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const UserModel = app.get(getModelToken('User'));
    const CompanyModel = app.get(getModelToken('Company'));
    const VendorModel = app.get(getModelToken('Vendor'));
    const EventItemModel = app.get(getModelToken('EventItem'));
    const EventModel = app.get(getModelToken('Event'));

    console.log('🗑️  Clearing existing data...');
    await UserModel.deleteMany({});
    await CompanyModel.deleteMany({});
    await VendorModel.deleteMany({});
    await EventItemModel.deleteMany({});
    await EventModel.deleteMany({});
    console.log('✅ Existing data cleared\n');

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

    console.log('👥 Seeding users...');
    const salt = await bcrypt.genSalt(10);
    
    const users = await UserModel.insertMany([
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

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📋 Seed Summary:');
    console.log('================');
    console.log(`Companies: ${companies.length}`);
    console.log(`Vendors: ${vendors.length}`);
    console.log(`Users: ${users.length}`);
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
