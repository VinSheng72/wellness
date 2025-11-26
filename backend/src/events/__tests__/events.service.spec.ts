import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { EventsRepository } from '../events.repository';
import { EventItemsRepository } from '../../event-items/event-items.repository';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: jest.Mocked<EventsRepository>;
  let eventItemsRepository: jest.Mocked<EventItemsRepository>;

  const mockEventItem = {
    _id: new Types.ObjectId(),
    vendorId: new Types.ObjectId(),
    name: 'Yoga Session',
    description: 'Relaxing yoga',
  };

  const mockEvent = {
    _id: new Types.ObjectId(),
    companyId: new Types.ObjectId(),
    eventItemId: new Types.ObjectId(),
    vendorId: new Types.ObjectId(),
    proposedDates: [new Date('2024-01-15'), new Date('2024-01-16'), new Date('2024-01-17')],
    location: { postalCode: '123456', streetName: 'Main St' },
    status: 'Pending',
    dateCreated: new Date(),
    lastModified: new Date(),
  };

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

  describe('create', () => {
    it('should create an event with vendor assignment from event item', async () => {
      const createEventData = {
        eventItemId: mockEventItem._id.toString(),
        proposedDates: ['2024-01-15', '2024-01-16', '2024-01-17'],
        location: { postalCode: '123456', streetName: 'Main St' },
      };
      const companyId = new Types.ObjectId().toString();

      eventItemsRepository.findById.mockResolvedValue(mockEventItem as any);
      eventsRepository.create.mockResolvedValue(mockEvent as any);

      const result = await service.create(createEventData, companyId);

      expect(eventItemsRepository.findById).toHaveBeenCalledWith(createEventData.eventItemId);
      expect(eventsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vendorId: mockEventItem.vendorId,
          status: 'Pending',
        }),
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event item not found', async () => {
      const createEventData = {
        eventItemId: new Types.ObjectId().toString(),
        proposedDates: ['2024-01-15', '2024-01-16', '2024-01-17'],
        location: { postalCode: '123456', streetName: 'Main St' },
      };

      eventItemsRepository.findById.mockResolvedValue(null);

      await expect(service.create(createEventData, 'companyId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCompany', () => {
    it('should return events for a company', async () => {
      const companyId = new Types.ObjectId().toString();
      const events = [mockEvent];

      eventsRepository.findByCompany.mockResolvedValue(events as any);

      const result = await service.findByCompany(companyId);

      expect(eventsRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(events);
    });
  });

  describe('findByVendor', () => {
    it('should return events for a vendor', async () => {
      const vendorId = new Types.ObjectId().toString();
      const events = [mockEvent];

      eventsRepository.findByVendor.mockResolvedValue(events as any);

      const result = await service.findByVendor(vendorId);

      expect(eventsRepository.findByVendor).toHaveBeenCalledWith(vendorId);
      expect(result).toEqual(events);
    });
  });

  describe('approve', () => {
    it('should approve a pending event with valid confirmed date', async () => {
      const eventId = mockEvent._id.toString();
      const vendorId = mockEvent.vendorId.toString();
      const approveData = { confirmedDate: '2024-01-15' };
      const updatedEvent = { ...mockEvent, status: 'Approved', confirmedDate: new Date('2024-01-15') };

      eventsRepository.findById.mockResolvedValue(mockEvent as any);
      eventsRepository.update.mockResolvedValue(updatedEvent as any);

      const result = await service.approve(eventId, approveData, vendorId);

      expect(eventsRepository.update).toHaveBeenCalledWith(
        eventId,
        expect.objectContaining({
          status: 'Approved',
          confirmedDate: expect.any(Date),
        }),
      );
      expect(result.status).toBe('Approved');
    });

    it('should throw ForbiddenException if vendor does not own the event', async () => {
      const eventId = mockEvent._id.toString();
      const wrongVendorId = new Types.ObjectId().toString();
      const approveData = { confirmedDate: '2024-01-15' };

      eventsRepository.findById.mockResolvedValue(mockEvent as any);

      await expect(service.approve(eventId, approveData, wrongVendorId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if event is not pending', async () => {
      const eventId = mockEvent._id.toString();
      const vendorId = mockEvent.vendorId.toString();
      const approveData = { confirmedDate: '2024-01-15' };
      const approvedEvent = { ...mockEvent, status: 'Approved' };

      eventsRepository.findById.mockResolvedValue(approvedEvent as any);

      await expect(service.approve(eventId, approveData, vendorId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if confirmed date is not in proposed dates', async () => {
      const eventId = mockEvent._id.toString();
      const vendorId = mockEvent.vendorId.toString();
      const approveData = { confirmedDate: '2024-02-01' };

      eventsRepository.findById.mockResolvedValue(mockEvent as any);

      await expect(service.approve(eventId, approveData, vendorId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending event with remarks', async () => {
      const eventId = mockEvent._id.toString();
      const vendorId = mockEvent.vendorId.toString();
      const rejectData = { remarks: 'Cannot accommodate' };
      const updatedEvent = { ...mockEvent, status: 'Rejected', remarks: 'Cannot accommodate' };

      eventsRepository.findById.mockResolvedValue(mockEvent as any);
      eventsRepository.update.mockResolvedValue(updatedEvent as any);

      const result = await service.reject(eventId, rejectData, vendorId);

      expect(eventsRepository.update).toHaveBeenCalledWith(
        eventId,
        expect.objectContaining({
          status: 'Rejected',
          remarks: 'Cannot accommodate',
        }),
      );
      expect(result.status).toBe('Rejected');
    });

    it('should throw ForbiddenException if vendor does not own the event', async () => {
      const eventId = mockEvent._id.toString();
      const wrongVendorId = new Types.ObjectId().toString();
      const rejectData = { remarks: 'Cannot accommodate' };

      eventsRepository.findById.mockResolvedValue(mockEvent as any);

      await expect(service.reject(eventId, rejectData, wrongVendorId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if event is not pending', async () => {
      const eventId = mockEvent._id.toString();
      const vendorId = mockEvent.vendorId.toString();
      const rejectData = { remarks: 'Cannot accommodate' };
      const rejectedEvent = { ...mockEvent, status: 'Rejected' };

      eventsRepository.findById.mockResolvedValue(rejectedEvent as any);

      await expect(service.reject(eventId, rejectData, vendorId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateAccess', () => {
    it('should allow HR_ADMIN to access their company events', async () => {
      const user = {
        id: 'user1',
        role: 'HR_ADMIN',
        companyId: mockEvent.companyId.toString(),
      };

      await expect(service.validateAccess(mockEvent as any, user)).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if HR_ADMIN tries to access another company event', async () => {
      const user = {
        id: 'user1',
        role: 'HR_ADMIN',
        companyId: new Types.ObjectId().toString(),
      };

      await expect(service.validateAccess(mockEvent as any, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow VENDOR_ADMIN to access their vendor events', async () => {
      const user = {
        id: 'user1',
        role: 'VENDOR_ADMIN',
        vendorId: mockEvent.vendorId.toString(),
      };

      await expect(service.validateAccess(mockEvent as any, user)).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if VENDOR_ADMIN tries to access another vendor event', async () => {
      const user = {
        id: 'user1',
        role: 'VENDOR_ADMIN',
        vendorId: new Types.ObjectId().toString(),
      };

      await expect(service.validateAccess(mockEvent as any, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
