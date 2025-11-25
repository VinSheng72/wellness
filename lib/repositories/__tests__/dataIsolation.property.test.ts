import fc from 'fast-check';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Company from '../../models/Company';
import Vendor from '../../models/Vendor';
import EventItem from '../../models/EventItem';
import Event, { EventStatus } from '../../models/Event';
import { EventRepository } from '../EventRepository';

let mongoServer: MongoMemoryServer;
let eventRepository: EventRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  eventRepository = new EventRepository();
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

// Feature: wellness-event-booking, Property 9: HR Admin data isolation
describe('Property 9: HR Admin data isolation', () => {
  it('should return only events for the specified company', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (
          companyName1,
          vendorName,
          vendorEmail,
          location,
          proposedDates,
          eventsForCompany1,
          eventsForCompany2
        ) => {
          // Create two distinct companies
          const company1 = await Company.create({ name: companyName1 });
          const company2 = await Company.create({ name: `${companyName1}_other` });

          // Create vendor and event item
          const vendor = await Vendor.create({
            name: vendorName,
            contactEmail: vendorEmail,
          });
          const eventItem = await EventItem.create({
            name: 'Test Event Item',
            vendorId: vendor._id,
          });

          // Create events for company1
          const company1EventIds = [];
          for (let i = 0; i < eventsForCompany1; i++) {
            const event = await Event.create({
              companyId: company1._id,
              eventItemId: eventItem._id,
              vendorId: vendor._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
              dateCreated: new Date(),
              lastModified: new Date(),
            });
            company1EventIds.push(event._id.toString());
          }

          // Create events for company2
          for (let i = 0; i < eventsForCompany2; i++) {
            await Event.create({
              companyId: company2._id,
              eventItemId: eventItem._id,
              vendorId: vendor._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
              dateCreated: new Date(),
              lastModified: new Date(),
            });
          }

          // Query events for company1
          const company1Events = await eventRepository.findByCompany(company1._id);

          // All returned events should belong to company1
          expect(company1Events).toHaveLength(eventsForCompany1);
          for (const event of company1Events) {
            expect(event.companyId._id.toString()).toBe(company1._id.toString());
            expect(company1EventIds).toContain(event._id.toString());
          }

          // Query events for company2
          const company2Events = await eventRepository.findByCompany(company2._id);

          // All returned events should belong to company2
          expect(company2Events).toHaveLength(eventsForCompany2);
          for (const event of company2Events) {
            expect(event.companyId._id.toString()).toBe(company2._id.toString());
          }

          // No overlap between company1 and company2 events
          const company1Ids = company1Events.map((e) => e._id.toString());
          const company2Ids = company2Events.map((e) => e._id.toString());
          const intersection = company1Ids.filter((id) => company2Ids.includes(id));
          expect(intersection).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: wellness-event-booking, Property 12: Vendor Admin data isolation
describe('Property 12: Vendor Admin data isolation', () => {
  it('should return only events for the specified vendor', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArbitrary(2, 50),
        nonEmptyStringArbitrary(2, 50),
        emailArbitrary,
        emailArbitrary,
        locationArbitrary,
        proposedDatesArbitrary,
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (
          companyName,
          vendorName1,
          vendorEmail1,
          vendorEmail2,
          location,
          proposedDates,
          eventsForVendor1,
          eventsForVendor2
        ) => {
          // Create company
          const company = await Company.create({ name: companyName });

          // Create two distinct vendors
          const vendor1 = await Vendor.create({
            name: vendorName1,
            contactEmail: vendorEmail1,
          });
          const vendor2 = await Vendor.create({
            name: `${vendorName1}_other`,
            contactEmail: vendorEmail2,
          });

          // Create event items for each vendor
          const eventItem1 = await EventItem.create({
            name: 'Event Item 1',
            vendorId: vendor1._id,
          });
          const eventItem2 = await EventItem.create({
            name: 'Event Item 2',
            vendorId: vendor2._id,
          });

          // Create events for vendor1
          const vendor1EventIds = [];
          for (let i = 0; i < eventsForVendor1; i++) {
            const event = await Event.create({
              companyId: company._id,
              eventItemId: eventItem1._id,
              vendorId: vendor1._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
              dateCreated: new Date(),
              lastModified: new Date(),
            });
            vendor1EventIds.push(event._id.toString());
          }

          // Create events for vendor2
          for (let i = 0; i < eventsForVendor2; i++) {
            await Event.create({
              companyId: company._id,
              eventItemId: eventItem2._id,
              vendorId: vendor2._id,
              proposedDates,
              location,
              status: EventStatus.PENDING,
              dateCreated: new Date(),
              lastModified: new Date(),
            });
          }

          // Query events for vendor1
          const vendor1Events = await eventRepository.findByVendor(vendor1._id);

          // All returned events should belong to vendor1
          expect(vendor1Events).toHaveLength(eventsForVendor1);
          for (const event of vendor1Events) {
            expect(event.vendorId._id.toString()).toBe(vendor1._id.toString());
            expect(vendor1EventIds).toContain(event._id.toString());
          }

          // Query events for vendor2
          const vendor2Events = await eventRepository.findByVendor(vendor2._id);

          // All returned events should belong to vendor2
          expect(vendor2Events).toHaveLength(eventsForVendor2);
          for (const event of vendor2Events) {
            expect(event.vendorId._id.toString()).toBe(vendor2._id.toString());
          }

          // No overlap between vendor1 and vendor2 events
          const vendor1Ids = vendor1Events.map((e) => e._id.toString());
          const vendor2Ids = vendor2Events.map((e) => e._id.toString());
          const intersection = vendor1Ids.filter((id) => vendor2Ids.includes(id));
          expect(intersection).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
