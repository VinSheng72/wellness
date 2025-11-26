#!/usr/bin/env tsx
/**
 * Database Seed Script
 * 
 * This script populates the MongoDB database with initial sample data for testing:
 * - Companies
 * - Vendors
 * - Event Items
 * - Users (HR Admins and Vendor Admins)
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../lib/db/connection';
import Company from '../lib/models/Company';
import Vendor from '../lib/models/Vendor';
import EventItem from '../lib/models/EventItem';
import User, { UserRole } from '../lib/models/User';

// Load environment variables
dotenv.config();

/**
 * Sample data definitions
 */
const sampleData = {
  companies: [
    { name: 'Tech Innovations Inc' },
    { name: 'Global Health Solutions' },
    { name: 'Wellness Corp' },
  ],
  vendors: [
    { name: 'HealthFirst Wellness', contactEmail: 'contact@healthfirst.com' },
    { name: 'Vitality Screening Services', contactEmail: 'info@vitality.com' },
    { name: 'MindBody Wellness', contactEmail: 'hello@mindbody.com' },
  ],
  eventItems: [
    {
      name: 'Health Talk - Nutrition',
      description: 'Educational session on healthy eating and nutrition',
      vendorIndex: 0, // HealthFirst Wellness
    },
    {
      name: 'Health Talk - Mental Wellness',
      description: 'Workshop on stress management and mental health',
      vendorIndex: 2, // MindBody Wellness
    },
    {
      name: 'Onsite Health Screening',
      description: 'Comprehensive health screening including blood pressure, BMI, and cholesterol',
      vendorIndex: 1, // Vitality Screening Services
    },
    {
      name: 'Fitness Assessment',
      description: 'Physical fitness evaluation and personalized exercise recommendations',
      vendorIndex: 2, // MindBody Wellness
    },
    {
      name: 'Health Talk - Chronic Disease Prevention',
      description: 'Educational session on preventing diabetes, heart disease, and other chronic conditions',
      vendorIndex: 0, // HealthFirst Wellness
    },
  ],
  users: [
    {
      username: 'hr_tech',
      password: 'password123',
      role: UserRole.HR_ADMIN,
      companyIndex: 0, // Tech Innovations Inc
    },
    {
      username: 'hr_global',
      password: 'password123',
      role: UserRole.HR_ADMIN,
      companyIndex: 1, // Global Health Solutions
    },
    {
      username: 'hr_wellness',
      password: 'password123',
      role: UserRole.HR_ADMIN,
      companyIndex: 2, // Wellness Corp
    },
    {
      username: 'vendor_healthfirst',
      password: 'password123',
      role: UserRole.VENDOR_ADMIN,
      vendorIndex: 0, // HealthFirst Wellness
    },
    {
      username: 'vendor_vitality',
      password: 'password123',
      role: UserRole.VENDOR_ADMIN,
      vendorIndex: 1, // Vitality Screening Services
    },
    {
      username: 'vendor_mindbody',
      password: 'password123',
      role: UserRole.VENDOR_ADMIN,
      vendorIndex: 2, // MindBody Wellness
    },
  ],
};

/**
 * Clear all existing data from collections
 */
async function clearDatabase() {
  console.log('Clearing existing data...');
  
  await User.deleteMany({});
  await EventItem.deleteMany({});
  await Vendor.deleteMany({});
  await Company.deleteMany({});
  
  console.log('✓ Database cleared');
}

/**
 * Seed companies
 */
async function seedCompanies() {
  console.log('\nSeeding companies...');
  
  const companies = await Company.insertMany(sampleData.companies);
  
  console.log(`✓ Created ${companies.length} companies:`);
  companies.forEach((company) => {
    console.log(`  - ${company.name} (ID: ${company._id})`);
  });
  
  return companies;
}

/**
 * Seed vendors
 */
async function seedVendors() {
  console.log('\nSeeding vendors...');
  
  const vendors = await Vendor.insertMany(sampleData.vendors);
  
  console.log(`✓ Created ${vendors.length} vendors:`);
  vendors.forEach((vendor) => {
    console.log(`  - ${vendor.name} (ID: ${vendor._id})`);
  });
  
  return vendors;
}

/**
 * Seed event items
 */
async function seedEventItems(vendors: any[]) {
  console.log('\nSeeding event items...');
  
  const eventItemsData = sampleData.eventItems.map((item) => ({
    name: item.name,
    description: item.description,
    vendorId: vendors[item.vendorIndex]._id,
  }));
  
  const eventItems = await EventItem.insertMany(eventItemsData);
  
  console.log(`✓ Created ${eventItems.length} event items:`);
  eventItems.forEach((item) => {
    const vendor = vendors.find((v) => v._id.equals(item.vendorId));
    console.log(`  - ${item.name} → ${vendor?.name}`);
  });
  
  return eventItems;
}

/**
 * Seed users
 */
async function seedUsers(companies: any[], vendors: any[]) {
  console.log('\nSeeding users...');
  
  // Create users one by one to trigger pre-save hooks for password hashing
  const users = [];
  
  for (const user of sampleData.users) {
    const userData: any = {
      username: user.username,
      password: user.password,
      role: user.role,
    };
    
    if (user.role === UserRole.HR_ADMIN && user.companyIndex !== undefined) {
      userData.companyId = companies[user.companyIndex]._id;
    }
    
    if (user.role === UserRole.VENDOR_ADMIN && user.vendorIndex !== undefined) {
      userData.vendorId = vendors[user.vendorIndex]._id;
    }
    
    // Create and save user (triggers pre-save hook for password hashing)
    const newUser = new User(userData);
    await newUser.save();
    users.push(newUser);
  }
  
  console.log(`✓ Created ${users.length} users:`);
  users.forEach((user) => {
    if (user.role === UserRole.HR_ADMIN) {
      const company = companies.find((c) => c._id.equals(user.companyId));
      console.log(`  - ${user.username} (HR Admin) → ${company?.name}`);
    } else {
      const vendor = vendors.find((v) => v._id.equals(user.vendorId));
      console.log(`  - ${user.username} (Vendor Admin) → ${vendor?.name}`);
    }
  });
  
  return users;
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('=== Database Seed Script ===\n');
    
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ Connected to MongoDB\n');
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data in order (respecting foreign key relationships)
    const companies = await seedCompanies();
    const vendors = await seedVendors();
    const eventItems = await seedEventItems(vendors);
    const users = await seedUsers(companies, vendors);
    
    // Print summary
    console.log('\n=== Seed Summary ===');
    console.log(`Companies: ${companies.length}`);
    console.log(`Vendors: ${vendors.length}`);
    console.log(`Event Items: ${eventItems.length}`);
    console.log(`Users: ${users.length}`);
    
    console.log('\n✓ Database seeded successfully!');
    console.log('\nYou can now log in with the following credentials:');
    console.log('\nHR Admin Accounts:');
    console.log('  Username: hr_tech       Password: password123  (Tech Innovations Inc)');
    console.log('  Username: hr_global     Password: password123  (Global Health Solutions)');
    console.log('  Username: hr_wellness   Password: password123  (Wellness Corp)');
    console.log('\nVendor Admin Accounts:');
    console.log('  Username: vendor_healthfirst  Password: password123  (HealthFirst Wellness)');
    console.log('  Username: vendor_vitality     Password: password123  (Vitality Screening Services)');
    console.log('  Username: vendor_mindbody     Password: password123  (MindBody Wellness)');
    
  } catch (error) {
    console.error('\n✗ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDB();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Run seed function
seed();
