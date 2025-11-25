import { GET } from '../route';
import { NextRequest } from 'next/server';
import fc from 'fast-check';
import { connectDB } from '@/lib/db/connection';
import EventItem from '@/lib/models/EventItem';
import Vendor from '@/lib/models/Vendor';
import mongoose from 'mongoose';

// Mock database connection
jest.mock('@/lib/db/connection', () => ({
  connectDB: jest.fn(),
}));

describe('Event Items API Route - Property Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await EventItem.deleteMany({});
    await Vendor.deleteMany({});
    (connectDB as jest.Mock).mockResolvedValue(undefined);
  });

  // Feature: wellness-event-booking, Property 20: Event item dropdown population
  test('Property 20: For any set of event items in database, all should appear in API response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
            description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (eventItemsData) => {
          // Create a vendor first
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'test@vendor.com',
          });

          // Create event items in database
          const createdItems = await Promise.all(
            eventItemsData.map(item =>
              EventItem.create({
                name: item.name,
                vendorId: vendor._id,
                description: item.description,
              })
            )
          );

          // Call the API route
          const request = new NextRequest('http://localhost:3000/api/event-items');
          const response = await GET(request);
          const data = await response.json();

          // Verify all event items are in the response
          expect(data.eventItems).toHaveLength(createdItems.length);
          
          // Verify each created item appears in the response
          for (const createdItem of createdItems) {
            const foundItem = data.eventItems.find(
              (item: any) => item._id.toString() === createdItem._id.toString()
            );
            expect(foundItem).toBeDefined();
            expect(foundItem.name).toBe(createdItem.name);
            expect(foundItem.description).toBe(createdItem.description);
          }

          // Clean up
          await EventItem.deleteMany({});
          await Vendor.deleteMany({});
        }
      ),
      { numRuns: 20 } // Reduced runs due to database operations
    );
  });

  test('Property 20: Event items should include vendor information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          vendorName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
          vendorEmail: fc.emailAddress(),
          itemName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
        }),
        async (data) => {
          // Create a vendor
          const vendor = await Vendor.create({
            name: data.vendorName,
            contactEmail: data.vendorEmail,
          });

          // Create an event item
          const eventItem = await EventItem.create({
            name: data.itemName,
            vendorId: vendor._id,
          });

          // Call the API route
          const request = new NextRequest('http://localhost:3000/api/event-items');
          const response = await GET(request);
          const responseData = await response.json();

          // Find the created item in response
          const foundItem = responseData.eventItems.find(
            (item: any) => item._id.toString() === eventItem._id.toString()
          );

          // Verify vendor information is populated
          expect(foundItem).toBeDefined();
          expect(foundItem.vendorId).toBeDefined();
          expect(foundItem.vendorId.name).toBe(data.vendorName.trim());
          expect(foundItem.vendorId.contactEmail).toBe(data.vendorEmail.toLowerCase().trim());

          // Clean up
          await EventItem.deleteMany({});
          await Vendor.deleteMany({});
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 20: Empty database should return empty array', async () => {
    // Ensure database is empty
    await EventItem.deleteMany({});

    // Call the API route
    const request = new NextRequest('http://localhost:3000/api/event-items');
    const response = await GET(request);
    const data = await response.json();

    // Verify empty array is returned
    expect(data.eventItems).toEqual([]);
    expect(response.status).toBe(200);
  });
});
