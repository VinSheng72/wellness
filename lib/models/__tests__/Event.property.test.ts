import fc from 'fast-check';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Event, { EventStatus, IEvent } from '../Event';
import Company from '../Company';
import Vendor from '../Vendor';
import EventItem from '../EventItem';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Arbitraries (Generators)
const nonEmptyStringArbitrary = (minLength: number, maxLength: number) =>
  fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0);

const locationArbitrary = fc.record({
  postalCode: nonEmptyStringArbitrary(1, 10),
  streetName: nonEmptyStringArbitrary(1, 100),
});

const dateArbitrary = fc
  .date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .filter((d) => !isNaN(d.getTime()));

const proposedDatesArbitrary = (count: number) =>
  fc.array(dateArbitrary, { minLength: count, maxLength: count });

// Feature: wellness-event-booking, Property 4: Three proposed dates requirement
describe('Property 4: Three proposed dates requirement', () => {
  it('should accept events with exactly 3 proposed dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        proposedDatesArbitrary(3),
        async (location, proposedDates) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event with exactly 3 proposed dates
          const event = new Event({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should not throw validation error
          await expect(event.validate()).resolves.not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject events with fewer than 3 proposed dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        fc.integer({ min: 0, max: 2 }),
        async (location, dateCount) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          const proposedDates = await fc.sample(proposedDatesArbitrary(dateCount), 1);

          // Create event with fewer than 3 proposed dates
          const event = new Event({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates: proposedDates[0],
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should throw validation error
          await expect(event.validate()).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject events with more than 3 proposed dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        fc.integer({ min: 4, max: 10 }),
        async (location, dateCount) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          const proposedDates = await fc.sample(proposedDatesArbitrary(dateCount), 1);

          // Create event with more than 3 proposed dates
          const event = new Event({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates: proposedDates[0],
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should throw validation error
          await expect(event.validate()).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: wellness-event-booking, Property 5: Location requirement validation
describe('Property 5: Location requirement validation', () => {
  it('should reject events without a location', async () => {
    await fc.assert(
      fc.asyncProperty(proposedDatesArbitrary(3), async (proposedDates) => {
        // Create supporting documents
        const company = await Company.create({ name: 'Test Company' });
        const vendor = await Vendor.create({
          name: 'Test Vendor',
          contactEmail: 'vendor@test.com',
        });
        const eventItem = await EventItem.create({
          name: 'Test Event Item',
          vendorId: vendor._id,
        });

        // Create event without location
        const event = new Event({
          companyId: company._id,
          eventItemId: eventItem._id,
          vendorId: vendor._id,
          proposedDates,
          // location is missing
          status: EventStatus.PENDING,
          dateCreated: new Date(),
          lastModified: new Date(),
        });

        // Should throw validation error
        await expect(event.validate()).rejects.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should accept events with valid location', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        proposedDatesArbitrary(3),
        async (location, proposedDates) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event with location
          const event = new Event({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should not throw validation error
          await expect(event.validate()).resolves.not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: wellness-event-booking, Property 6: Event item requirement validation
describe('Property 6: Event item requirement validation', () => {
  it('should reject events without an event item', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        proposedDatesArbitrary(3),
        async (location, proposedDates) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });

          // Create event without eventItemId
          const event = new Event({
            companyId: company._id,
            // eventItemId is missing
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should throw validation error
          await expect(event.validate()).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept events with valid event item', async () => {
    await fc.assert(
      fc.asyncProperty(
        locationArbitrary,
        proposedDatesArbitrary(3),
        async (location, proposedDates) => {
          // Create supporting documents
          const company = await Company.create({ name: 'Test Company' });
          const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactEmail: 'vendor@test.com',
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event with eventItemId
          const event = new Event({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
            dateCreated: new Date(),
            lastModified: new Date(),
          });

          // Should not throw validation error
          await expect(event.validate()).resolves.not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
