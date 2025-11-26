import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { CompaniesRepository } from '../companies.repository';
import { Company, CompanySchema } from '../schemas/company.schema';

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;
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
          { name: Company.name, schema: CompanySchema },
        ]),
      ],
      providers: [CompaniesRepository],
    }).compile();

    repository = module.get<CompaniesRepository>(CompaniesRepository);
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
    it('should find company by id', async () => {
      const companyModel = mongoConnection.model('Company', CompanySchema);
      const created = await companyModel.create({
        name: 'Test Company',
        address: '123 Test St',
      });

      const company = await repository.findById(created._id);

      expect(company).toBeDefined();
      expect(company?.name).toBe('Test Company');
      expect(company?.address).toBe('123 Test St');
    });

    it('should return null if company not found', async () => {
      const company = await repository.findById('507f1f77bcf86cd799439011');
      expect(company).toBeNull();
    });
  });
});
