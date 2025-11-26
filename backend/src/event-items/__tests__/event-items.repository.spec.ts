import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Types } from 'mongoose';
import { EventItemsRepository } from '../event-items.repository';
import { EventItem, EventItemSchema } from '../schemas/event-item.schema';

describe('EventItemsRepository', () => {
  let repository: EventItemsRepository;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: EventItem.name, schema: EventItemSchema },
        ]),
      ],
      providers: [EventItemsRepository],
    }).compile();

    repository = module.get<EventItemsRepository>(EventItemsRepository);
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

  describe('findAll', () => {
    it('should return all event items', async () => {
      const eventItemModel = mongoConnection.model(
        'EventItem',
        EventItemSchema,
      );

      await eventItemModel.create({
        name: 'Yoga Session',
        vendorId: new Types.ObjectId(),
      });

      await eventItemModel.create({
        name: 'Meditation Workshop',
        vendorId: new Types.ObjectId(),
      });

      const items = await repository.findAll();

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('Yoga Session');
      expect(items[1].name).toBe('Meditation Workshop');
    });

    it('should return empty array when no items exist', async () => {
      const items = await repository.findAll();
      expect(items).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find event item by id', async () => {
      const eventItemModel = mongoConnection.model(
        'EventItem',
        EventItemSchema,
      );
      const created = await eventItemModel.create({
        name: 'Fitness Class',
        vendorId: new Types.ObjectId(),
      });

      const item = await repository.findById(created._id);

      expect(item).toBeDefined();
      expect(item?.name).toBe('Fitness Class');
    });

    it('should return null if event item not found', async () => {
      const item = await repository.findById('507f1f77bcf86cd799439011');
      expect(item).toBeNull();
    });
  });

  describe('schema indexes', () => {
    it('should have index on vendorId', async () => {
      const eventItemModel = mongoConnection.model(
        'EventItem',
        EventItemSchema,
      );
      const indexes = await eventItemModel.collection.getIndexes();

      expect(indexes).toHaveProperty('vendorId_1');
    });
  });
});
