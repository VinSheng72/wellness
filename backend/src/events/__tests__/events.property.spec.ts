import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { EventsService } from '../events.service';
import { EventsRepository } from '../events.repository';
import { EventItemsRepository } from '../../event-items/event-items.repository';
import { Types } from 'mongoose';
import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('EventsService - Property-Based Tests', () => {
  let service: EventsService;
  let eventsRepository: jest.Mocked<EventsRepository>;
  let eventItemsRepository: jest.Mocked<EventItemsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCompany: jest.fn(),
            findByVendor: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EventItemsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventsRepository = module.get(EventsRepository);
    eventItemsRepository = module.get(EventItemsRepository);
  });

  // Feature: nestjs-backend-migration, Property 10: Event creation with correct initial state
  describe('Property 10: Event creation with correct initial state', () => {
    it('for any valid event creation request, the created event should have status Pending', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 10 }),
          fc.string({ minLength: 3, maxLength: 20 }),
          async (postalCode, streetName) => {
            const eventItemId = new Types.ObjectId();
            const vendorId = new Types.ObjectId();
            const companyId = new Types.ObjectId();

            const createData = {
              eventItemId: eventItemId.toString(),
              proposedDates: ['2024-01-15', '2024-01-16', '2024-01-17'],
              location: { postalCode, streetName },
            };

            eventItemsRepository.findById.mockResolvedValue({
              _id: eventItemId,
              vendorId,
              name: 'Test Event',
              description: 'Test Description',
            } as any);

            let capturedEventData: any;
            eventsRepository.create.mockImplementation((data) => {
              capturedEventData = data;
              return Promise.resolve({ ...data, _id: new Types.ObjectId() } as any);
            });

            await service.create(createData, companyId.toString());

            expect(capturedEventData.status).toBe('Pending');
            expect(capturedEventData.vendorId).toEqual(vendorId);
            expect(capturedEventData.proposedDates).toHaveLength(3);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 11: Event data isolation by role
  describe('Property 11: Event data isolation by role', () => {
    it('for any company ID, findByCompany should only return events for that company', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (eventCount) => {
            const companyId = new Types.ObjectId();
            const events = Array.from({ length: eventCount }, () => ({
              _id: new Types.ObjectId(),
              companyId,
              vendorId: new Types.ObjectId(),
              status: 'Pending',
            }));

            eventsRepository.findByCompany.mockResolvedValue(events as any);

            const result = await service.findByCompany(companyId.toString());

            expect(result).toHaveLength(eventCount);
            result.forEach(event => {
              expect(event.companyId).toEqual(companyId);
            });
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 12: Event approval updates state correctly
  describe('Property 12: Event approval updates state correctly', () => {
    it('for any pending event with valid approval, status should be updated to Approved', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('2024-01-15', '2024-01-16', '2024-01-17'),
          async (confirmedDateStr) => {
            const eventId = new Types.ObjectId();
            const vendorId = new Types.ObjectId();
            const confirmedDate = new Date(confirmedDateStr);

            const pendingEvent = {
              _id: eventId,
              vendorId,
              status: 'Pending',
              proposedDates: [new Date('2024-01-15'), new Date('2024-01-16'), new Date('2024-01-17')],
            };

            eventsRepository.findById.mockResolvedValue(pendingEvent as any);
            eventsRepository.update.mockImplementation((id, data) =>
              Promise.resolve({ ...pendingEvent, ...data } as any)
            );

            const result = await service.approve(
              eventId.toString(),
              { confirmedDate: confirmedDateStr },
              vendorId.toString()
            );

            expect(result.status).toBe('Approved');
            expect(result.confirmedDate).toBeDefined();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('for any non-pending event, approval should throw BadRequestException', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Approved', 'Rejected'),
          async (nonPendingStatus) => {
            const eventId = new Types.ObjectId();
            const vendorId = new Types.ObjectId();

            const nonPendingEvent = {
              _id: eventId,
              vendorId,
              status: nonPendingStatus,
              proposedDates: [new Date('2024-01-15'), new Date('2024-01-16'), new Date('2024-01-17')],
            };

            eventsRepository.findById.mockResolvedValue(nonPendingEvent as any);

            await expect(
              service.approve(
                eventId.toString(),
                { confirmedDate: '2024-01-15' },
                vendorId.toString()
              )
            ).rejects.toThrow(BadRequestException);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 13: Event rejection updates state correctly
  describe('Property 13: Event rejection updates state correctly', () => {
    it('for any pending event with valid rejection, status should be updated to Rejected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (remarks) => {
            const eventId = new Types.ObjectId();
            const vendorId = new Types.ObjectId();

            const pendingEvent = {
              _id: eventId,
              vendorId,
              status: 'Pending',
            };

            eventsRepository.findById.mockResolvedValue(pendingEvent as any);
            eventsRepository.update.mockImplementation((id, data) =>
              Promise.resolve({ ...pendingEvent, ...data } as any)
            );

            const result = await service.reject(
              eventId.toString(),
              { remarks },
              vendorId.toString()
            );

            expect(result.status).toBe('Rejected');
            expect(result.remarks).toBe(remarks);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 14: Event access authorization
  describe('Property 14: Event access authorization', () => {
    it('for any HR_ADMIN user, they should only access events from their company', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }),
          async (userId) => {
            const companyId = new Types.ObjectId();
            const event = {
              _id: new Types.ObjectId(),
              companyId,
              vendorId: new Types.ObjectId(),
            };

            const user = {
              id: userId,
              role: 'HR_ADMIN',
              companyId: companyId.toString(),
            };

            await expect(
              service.validateAccess(event as any, user)
            ).resolves.not.toThrow();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('for any HR_ADMIN user, they should be denied access to other company events', async () => {
      const userCompanyId = new Types.ObjectId();
      const eventCompanyId = new Types.ObjectId();

      const event = {
        _id: new Types.ObjectId(),
        companyId: eventCompanyId,
        vendorId: new Types.ObjectId(),
      };

      const user = {
        id: 'user1',
        role: 'HR_ADMIN',
        companyId: userCompanyId.toString(),
      };

      await expect(
        service.validateAccess(event as any, user)
      ).rejects.toThrow(ForbiddenException);
    });

    it('for any VENDOR_ADMIN user, they should only access events from their vendor', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }),
          async (userId) => {
            const vendorId = new Types.ObjectId();
            const event = {
              _id: new Types.ObjectId(),
              companyId: new Types.ObjectId(),
              vendorId,
            };

            const user = {
              id: userId,
              role: 'VENDOR_ADMIN',
              vendorId: vendorId.toString(),
            };

            await expect(
              service.validateAccess(event as any, user)
            ).resolves.not.toThrow();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('for any VENDOR_ADMIN user, they should be denied access to other vendor events', async () => {
      const userVendorId = new Types.ObjectId();
      const eventVendorId = new Types.ObjectId();

      const event = {
        _id: new Types.ObjectId(),
        companyId: new Types.ObjectId(),
        vendorId: eventVendorId,
      };

      const user = {
        id: 'user1',
        role: 'VENDOR_ADMIN',
        vendorId: userVendorId.toString(),
      };

      await expect(
        service.validateAccess(event as any, user)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // Feature: nestjs-backend-migration, Property 16: Three proposed dates validation
  describe('Property 16: Three proposed dates validation', () => {
    it('for any event creation, exactly 3 proposed dates should be stored', async () => {
      const eventItemId = new Types.ObjectId();
      const vendorId = new Types.ObjectId();
      const companyId = new Types.ObjectId();

      const createData = {
        eventItemId: eventItemId.toString(),
        proposedDates: ['2024-01-15', '2024-01-16', '2024-01-17'],
        location: { postalCode: '123456', streetName: 'Main St' },
      };

      eventItemsRepository.findById.mockResolvedValue({
        _id: eventItemId,
        vendorId,
        name: 'Test Event',
        description: 'Test Description',
      } as any);

      let capturedEventData: any;
      eventsRepository.create.mockImplementation((data) => {
        capturedEventData = data;
        return Promise.resolve({ ...data, _id: new Types.ObjectId() } as any);
      });

      await service.create(createData, companyId.toString());

      expect(capturedEventData.proposedDates).toHaveLength(3);
    });
  });

  // Feature: nestjs-backend-migration, Property 17: Rejection remarks validation
  describe('Property 17: Rejection remarks validation', () => {
    it('for any event rejection, remarks should be non-empty and stored', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          async (remarks) => {
            const eventId = new Types.ObjectId();
            const vendorId = new Types.ObjectId();

            const pendingEvent = {
              _id: eventId,
              vendorId,
              status: 'Pending',
            };

            eventsRepository.findById.mockResolvedValue(pendingEvent as any);
            eventsRepository.update.mockImplementation((id, data) =>
              Promise.resolve({ ...pendingEvent, ...data } as any)
            );

            const result = await service.reject(
              eventId.toString(),
              { remarks },
              vendorId.toString()
            );

            expect(result.remarks).toBe(remarks);
            expect(result.remarks!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
