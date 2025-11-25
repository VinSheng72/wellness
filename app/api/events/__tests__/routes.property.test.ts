import fc from 'fast-check';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Company from '@/lib/models/Company';
import Vendor from '@/lib/models/Vendor';
import EventItem from '@/lib/models/EventItem';
import Event, { EventStatus } from '@/lib/models/Event';
import EventRepository from '@/lib/repositories/EventRepository';

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
  fc
    .string({ minLength, maxLength })
    .filter((s) => s.trim().length >= minLength)
    .map((s) => s.trim());

const emailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]{3,10}$/),
    fc.stringMatching(/^[a-z0-9]{3,10}$/),
    fc.constantFrom('com', 'org', 'net')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const locationArbitrary = fc.record({
  postalCode: nonEmptyStringArbitrary(1, 10),
  streetName: nonEmptyStringArbitrary(1, 100),
});

const dateArbitrary = fc
  .date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .filter((d) => !isNaN(d.getTime()));

const proposedDatesArbitrary = fc.array(dateArbitrary, { minLength: 3, maxLength: 3 });

const remarksArbitrary = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

// Feature: wellness-event-booking, Property 16: Event persistence round-trip
// **Validates: Requirements 7.1**
describe('Property 16: Event persistence round-trip', () => {
  it('should retrieve the same event data after creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        async (companyName, vendorName, vendorEmail, location, proposedDates) => {
          // Create test data
          const company = await Company.create({ name: companyName });
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event
          const createdEvent = await EventRepository.create({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
          });

          // Retrieve event by ID
          const retrievedEvent = await EventRepository.findById(createdEvent._id);

          // Verify all fields match
          expect(retrievedEvent).not.toBeNull();
          expect(retrievedEvent!._id.toString()).toBe(createdEvent._id.toString());
          expect(retrievedEvent!.companyId._id.toString()).toBe(company._id.toString());
          expect(retrievedEvent!.eventItemId._id.toString()).toBe(eventItem._id.toString());
          expect(retrievedEvent!.vendorId._id.toString()).toBe(vendor._id.toString());
          expect(retrievedEvent!.status).toBe(EventStatus.PENDING);
          expect(retrievedEvent!.location.postalCode).toBe(location.postalCode);
          expect(retrievedEvent!.location.streetName).toBe(location.streetName);
          
          // Verify proposed dates match
          expect(retrievedEvent!.proposedDates).toHaveLength(3);
          for (let i = 0; i < 3; i++) {
            expect(retrievedEvent!.proposedDates[i].getTime()).toBe(
              proposedDates[i].getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: wellness-event-booking, Property 17: Status change persistence
// **Validates: Requirements 7.2**
describe('Property 17: Status change persistence', () => {
  it('should persist status changes from Pending to Approved', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        fc.integer({ min: 0, max: 2 }),
        async (
          companyName,
          vendorName,
          vendorEmail,
          location,
          proposedDates,
          dateIndex
        ) => {
          // Create test data
          const company = await Company.create({ name: companyName });
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event
          const createdEvent = await EventRepository.create({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
          });

          // Verify initial status
          expect(createdEvent.status).toBe(EventStatus.PENDING);

          // Update status to Approved
          const selectedDate = proposedDates[dateIndex];
          await EventRepository.update(createdEvent._id, {
            status: EventStatus.APPROVED,
            confirmedDate: selectedDate,
          });

          // Retrieve event and verify status change persisted
          const updatedEvent = await EventRepository.findById(createdEvent._id);
          expect(updatedEvent).not.toBeNull();
          expect(updatedEvent!.status).toBe(EventStatus.APPROVED);
          expect(updatedEvent!.confirmedDate).toBeDefined();
          expect(updatedEvent!.confirmedDate!.getTime()).toBe(selectedDate.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist status changes from Pending to Rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        remarksArbitrary,
        async (companyName, vendorName, vendorEmail, location, proposedDates, remarks) => {
          // Create test data
          const company = await Company.create({ name: companyName });
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create event
          const createdEvent = await EventRepository.create({
            companyId: company._id,
            eventItemId: eventItem._id,
            vendorId: vendor._id,
            proposedDates,
            location,
            status: EventStatus.PENDING,
          });

          // Verify initial status
          expect(createdEvent.status).toBe(EventStatus.PENDING);

          // Update status to Rejected
          await EventRepository.update(createdEvent._id, {
            status: EventStatus.REJECTED,
            remarks: remarks.trim(),
          });

          // Retrieve event and verify status change persisted
          const updatedEvent = await EventRepository.findById(createdEvent._id);
          expect(updatedEvent).not.toBeNull();
          expect(updatedEvent!.status).toBe(EventStatus.REJECTED);
          expect(updatedEvent!.remarks).toBe(remarks.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: wellness-event-booking, Property 18: Dashboard data freshness
// **Validates: Requirements 7.3**
describe('Property 18: Dashboard data freshness', () => {
  it('should reflect current database state for HR Admin dashboard', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        fc.integer({ min: 1, max: 5 }),
        async (
          companyName,
          vendorName,
          vendorEmail,
          location,
          proposedDates,
          numEvents
        ) => {
          // Create test data
          const company = await Company.create({ name: companyName });
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create multiple events
          const createdEventIds = [];
          for (let i = 0; i < numEvents; i++) {
            const event = await EventRepository.create({
              companyId: company._id,
              eventItemId: eventItem._id,
              vendorId: vendor._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
            });
            createdEventIds.push(event._id.toString());
          }

          // Query events for company (simulating dashboard data fetch)
          const dashboardEvents = await EventRepository.findByCompany(company._id);

          // Verify dashboard shows all current events
          expect(dashboardEvents).toHaveLength(numEvents);
          const dashboardEventIds = dashboardEvents.map((e) => e._id.toString());
          for (const createdId of createdEventIds) {
            expect(dashboardEventIds).toContain(createdId);
          }

          // Update one event status
          if (numEvents > 0) {
            await EventRepository.update(createdEventIds[0], {
              status: EventStatus.APPROVED,
              confirmedDate: proposedDates[0],
            });

            // Re-query dashboard
            const updatedDashboardEvents = await EventRepository.findByCompany(company._id);

            // Verify updated status is reflected
            const updatedEvent = updatedDashboardEvents.find(
              (e) => e._id.toString() === createdEventIds[0]
            );
            expect(updatedEvent).toBeDefined();
            expect(updatedEvent!.status).toBe(EventStatus.APPROVED);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reflect current database state for Vendor Admin dashboard', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        fc.integer({ min: 1, max: 5 }),
        async (
          companyName,
          vendorName,
          vendorEmail,
          location,
          proposedDates,
          numEvents
        ) => {
          // Create test data
          const company = await Company.create({ name: companyName });
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create multiple events
          const createdEventIds = [];
          for (let i = 0; i < numEvents; i++) {
            const event = await EventRepository.create({
              companyId: company._id,
              eventItemId: eventItem._id,
              vendorId: vendor._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
            });
            createdEventIds.push(event._id.toString());
          }

          // Query events for vendor (simulating dashboard data fetch)
          const dashboardEvents = await EventRepository.findByVendor(vendor._id);

          // Verify dashboard shows all current events
          expect(dashboardEvents).toHaveLength(numEvents);
          const dashboardEventIds = dashboardEvents.map((e) => e._id.toString());
          for (const createdId of createdEventIds) {
            expect(dashboardEventIds).toContain(createdId);
          }

          // Update one event status
          if (numEvents > 0) {
            await EventRepository.update(createdEventIds[0], {
              status: EventStatus.REJECTED,
              remarks: 'Test rejection',
            });

            // Re-query dashboard
            const updatedDashboardEvents = await EventRepository.findByVendor(vendor._id);

            // Verify updated status is reflected
            const updatedEvent = updatedDashboardEvents.find(
              (e) => e._id.toString() === createdEventIds[0]
            );
            expect(updatedEvent).toBeDefined();
            expect(updatedEvent!.status).toBe(EventStatus.REJECTED);
            expect(updatedEvent!.remarks).toBe('Test rejection');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
