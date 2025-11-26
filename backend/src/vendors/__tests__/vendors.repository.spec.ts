import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { VendorsRepository } from '../vendors.repository';
import { Vendor, VendorSchema } from '../schemas/vendor.schema';

describe('VendorsRepository', () => {
  let repository: VendorsRepository;
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
          { name: Vendor.name, schema: VendorSchema },
        ]),
      ],
      providers: [VendorsRepository],
    }).compile();

    repository = module.get<VendorsRepository>(VendorsRepository);
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

  describe('findById', () => {
    it('should find vendor by id', async () => {
      const vendorModel = mongoConnection.model('Vendor', VendorSchema);
      const created = await vendorModel.create({
        name: 'Test Vendor',
        description: 'A test vendor',
      });

      const vendor = await repository.findById(created._id);

      expect(vendor).toBeDefined();
      expect(vendor?.name).toBe('Test Vendor');
      expect(vendor?.description).toBe('A test vendor');
    });

    it('should return null if vendor not found', async () => {
      const vendor = await repository.findById('507f1f77bcf86cd799439011');
      expect(vendor).toBeNull();
    });
  });
});
