import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Types } from 'mongoose';
import { EventsRepository } from '../events.repository';
import { Event, EventSchema } from '../schemas/event.schema';

describe('EventsRepository', () => {
  let repository: EventsRepository;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
      ],
      providers: [EventsRepository],
    }).compile();

    repository = module.get<EventsRepository>(EventsRepository);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const eventData = {
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: {
          postalCode: '123456',
          streetName: 'Test Street',
        },
        status: 'Pending',
      };

      const event = await repository.create(eventData);

      expect(event).toBeDefined();
      expect(event.status).toBe('Pending');
      expect(event.proposedDates).toHaveLength(3);
      expect(event.location.postalCode).toBe('123456');
    });

    it('should reject event with invalid number of proposed dates', async () => {
      const eventData = {
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date()], // Only 2 dates
        location: {
          postalCode: '123456',
          streetName: 'Test Street',
        },
        status: 'Pending',
      };

      await expect(repository.create(eventData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find event by id', async () => {
      const created = await repository.create({
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: {
          postalCode: '123456',
          streetName: 'Test Street',
        },
        status: 'Pending',
      });

      const event = await repository.findById(created._id);

      expect(event).toBeDefined();
      expect(event?._id.toString()).toBe(created._id.toString());
    });

    it('should return null if event not found', async () => {
      const event = await repository.findById('507f1f77bcf86cd799439011');
      expect(event).toBeNull();
    });
  });

  describe('findByCompany', () => {
    it('should find events by company id', async () => {
      const companyId = new Types.ObjectId();
      const otherCompanyId = new Types.ObjectId();

      await repository.create({
        companyId,
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
      });

      await repository.create({
        companyId: otherCompanyId,
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '654321', streetName: 'Other Street' },
        status: 'Pending',
      });

      const events = await repository.findByCompany(companyId);

      expect(events).toHaveLength(1);
      expect(events[0].companyId.toString()).toBe(companyId.toString());
    });

    it('should return events sorted by dateCreated descending', async () => {
      const companyId = new Types.ObjectId();

      const event1 = await repository.create({
        companyId,
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
        dateCreated: new Date('2024-01-01'),
      });

      const event2 = await repository.create({
        companyId,
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
        dateCreated: new Date('2024-01-02'),
      });

      const events = await repository.findByCompany(companyId);

      expect(events).toHaveLength(2);
      expect(events[0]._id.toString()).toBe(event2._id.toString());
      expect(events[1]._id.toString()).toBe(event1._id.toString());
    });
  });

  describe('findByVendor', () => {
    it('should find events by vendor id', async () => {
      const vendorId = new Types.ObjectId();
      const otherVendorId = new Types.ObjectId();

      await repository.create({
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId,
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
      });

      await repository.create({
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: otherVendorId,
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '654321', streetName: 'Other Street' },
        status: 'Pending',
      });

      const events = await repository.findByVendor(vendorId);

      expect(events).toHaveLength(1);
      expect(events[0].vendorId.toString()).toBe(vendorId.toString());
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      const created = await repository.create({
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
      });

      const updated = await repository.update(created._id, {
        status: 'Approved',
        confirmedDate: new Date(),
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('Approved');
      expect(updated?.confirmedDate).toBeDefined();
    });

    it('should update lastModified timestamp', async () => {
      const created = await repository.create({
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'Pending',
      });

      const originalLastModified = created.lastModified;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.update(created._id, {
        status: 'Approved',
      });

      expect(updated?.lastModified.getTime()).toBeGreaterThan(
        originalLastModified.getTime(),
      );
    });
  });

  describe('schema validation', () => {
    it('should validate status enum', async () => {
      const eventData = {
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456', streetName: 'Test Street' },
        status: 'InvalidStatus',
      };

      await expect(repository.create(eventData)).rejects.toThrow();
    });

    it('should require location fields', async () => {
      const eventData = {
        companyId: new Types.ObjectId(),
        eventItemId: new Types.ObjectId(),
        vendorId: new Types.ObjectId(),
        proposedDates: [new Date(), new Date(), new Date()],
        location: { postalCode: '123456' } as any, // Missing streetName
        status: 'Pending',
      };

      await expect(repository.create(eventData)).rejects.toThrow();
    });
  });
});
