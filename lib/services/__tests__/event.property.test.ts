import fc from 'fast-check';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../db';
import EventService from '../EventService';
import Event, { EventStatus } from '../../models/Event';
import EventItem from '../../models/EventItem';
import Company from '../../models/Company';
import Vendor from '../../models/Vendor';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  // Clean up database between tests
  await Event.deleteMany({});
  await EventItem.deleteMany({});
  await Company.deleteMany({});
  await Vendor.deleteMany({});
});

// Generators for property-based testing

/**
 * Generate valid postal code (non-empty after trimming)
 */
const postalCodeArbitrary = fc
  .string({ minLength: 3, maxLength: 10 })
  .filter((s) => s.trim().length >= 3);

/**
 * Generate valid street name (non-empty after trimming)
 */
const streetNameArbitrary = fc
  .string({ minLength: 3, maxLength: 100 })
  .filter((s) => s.trim().length >= 3);

/**
 * Generate valid location
 */
const locationArbitrary = fc.record({
  postalCode: postalCodeArbitrary,
  streetName: streetNameArbitrary,
});

/**
 * Generate exactly 3 valid dates (no NaN dates)
 */
const threeDatesArbitrary = fc
  .tuple(fc.date(), fc.date(), fc.date())
  .filter(([d1, d2, d3]) => !isNaN(d1.getTime()) && !isNaN(d2.getTime()) && !isNaN(d3.getTime()));

/**
 * Generate valid remarks (non-empty string)
 */
const remarksArbitrary = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

/**
 * Generate whitespace-only remarks (invalid)
 */
const whitespaceRemarksArbitrary = fc
  .string({ minLength: 1, maxLength: 50 })
  .map((s) => ' '.repeat(s.length));

describe('Event Service Property Tests', () => {
  // Feature: wellness-event-booking, Property 7: Initial event state correctness
  describe('Property 7: Initial event state correctness', () => {
    it(
      'should create events with Pending status and current timestamp',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            threeDatesArbitrary,
            async (location, dates) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              const beforeCreate = new Date();

              // Create event
              const event = await EventService.createEvent(
                {
                  eventItemId: eventItem._id.toString(),
                  proposedDates: [dates[0], dates[1], dates[2]],
                  location,
                },
                company._id.toString()
              );

              const afterCreate = new Date();

              // Verify initial state
              expect(event.status).toBe(EventStatus.PENDING);
              expect(event.dateCreated).toBeDefined();
              expect(event.dateCreated.getTime()).toBeGreaterThanOrEqual(
                beforeCreate.getTime()
              );
              expect(event.dateCreated.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  // Feature: wellness-event-booking, Property 8: Vendor assignment from event item
  describe('Property 8: Vendor assignment from event item', () => {
    it(
      'should assign vendor from event item to created event',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            threeDatesArbitrary,
            async (location, dates) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              // Create event
              const event = await EventService.createEvent(
                {
                  eventItemId: eventItem._id.toString(),
                  proposedDates: [dates[0], dates[1], dates[2]],
                  location,
                },
                company._id.toString()
              );

              // Verify vendor assignment
              // vendorId might be populated, so we need to handle both cases
              const eventVendorId =
                typeof event.vendorId === 'object' && '_id' in event.vendorId
                  ? event.vendorId._id.toString()
                  : event.vendorId.toString();
              expect(eventVendorId).toBe(vendor._id.toString());
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  // Feature: wellness-event-booking, Property 13: Event approval updates state correctly
  describe('Property 13: Event approval updates state correctly', () => {
    it(
      'should update status to Approved and set confirmed date',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            threeDatesArbitrary,
            fc.integer({ min: 0, max: 2 }),
            async (location, dates, dateIndex) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              // Create event
              const event = await EventService.createEvent(
                {
                  eventItemId: eventItem._id.toString(),
                  proposedDates: [dates[0], dates[1], dates[2]],
                  location,
                },
                company._id.toString()
              );

              // Select one of the proposed dates
              const selectedDate = dates[dateIndex];

              // Approve event
              const approvedEvent = await EventService.approveEvent(
                event._id.toString(),
                selectedDate,
                vendor._id.toString()
              );

              // Verify approval
              expect(approvedEvent.status).toBe(EventStatus.APPROVED);
              expect(approvedEvent.confirmedDate).toBeDefined();
              expect(approvedEvent.confirmedDate?.getTime()).toBe(
                new Date(selectedDate).getTime()
              );
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  // Feature: wellness-event-booking, Property 14: Event rejection with remarks
  describe('Property 14: Event rejection with remarks', () => {
    it(
      'should update status to Rejected and store remarks',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            threeDatesArbitrary,
            remarksArbitrary,
            async (location, dates, remarks) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              // Create event
              const event = await EventService.createEvent(
                {
                  eventItemId: eventItem._id.toString(),
                  proposedDates: [dates[0], dates[1], dates[2]],
                  location,
                },
                company._id.toString()
              );

              // Reject event
              const rejectedEvent = await EventService.rejectEvent(
                event._id.toString(),
                remarks,
                vendor._id.toString()
              );

              // Verify rejection
              expect(rejectedEvent.status).toBe(EventStatus.REJECTED);
              expect(rejectedEvent.remarks).toBeDefined();
              expect(rejectedEvent.remarks).toBe(remarks.trim());
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  // Feature: wellness-event-booking, Property 15: Rejection remarks validation
  describe('Property 15: Rejection remarks validation', () => {
    it(
      'should reject events with empty or whitespace-only remarks',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            threeDatesArbitrary,
            fc.oneof(fc.constant(''), whitespaceRemarksArbitrary),
            async (location, dates, invalidRemarks) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              // Create event
              const event = await EventService.createEvent(
                {
                  eventItemId: eventItem._id.toString(),
                  proposedDates: [dates[0], dates[1], dates[2]],
                  location,
                },
                company._id.toString()
              );

              // Attempt to reject with invalid remarks
              await expect(
                EventService.rejectEvent(
                  event._id.toString(),
                  invalidRemarks,
                  vendor._id.toString()
                )
              ).rejects.toThrow('Rejection remarks cannot be empty');

              // Verify event status unchanged
              const unchangedEvent = await Event.findById(event._id);
              expect(unchangedEvent?.status).toBe(EventStatus.PENDING);
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  describe('Event Creation Validation', () => {
    it(
      'should reject events without exactly 3 proposed dates',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            locationArbitrary,
            fc
              .array(fc.date(), { minLength: 0, maxLength: 10 })
              .filter((arr) => arr.length !== 3),
            async (location, invalidDates) => {
              // Create test data
              const vendor = await Vendor.create({
                name: 'Test Vendor',
                contactEmail: 'vendor@test.com',
              });

              const company = await Company.create({
                name: 'Test Company',
              });

              const eventItem = await EventItem.create({
                name: 'Test Event Item',
                vendorId: vendor._id,
              });

              // Attempt to create event with invalid number of dates
              await expect(
                EventService.createEvent(
                  {
                    eventItemId: eventItem._id.toString(),
                    proposedDates: invalidDates,
                    location,
                  },
                  company._id.toString()
                )
              ).rejects.toThrow('Exactly 3 proposed dates are required');
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });
});
