import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { UsersRepository } from '../users.repository';
import { User, UserSchema } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersRepository],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
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
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        role: 'HR_ADMIN',
      };

      const user = await repository.create(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('HR_ADMIN');
      expect(user._id).toBeDefined();
    });

    it('should hash password on save', async () => {
      const userData = {
        username: 'testuser2',
        password: 'plainpassword',
        role: 'VENDOR_ADMIN',
      };

      const user = await repository.create(userData);

      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20);
      const isMatch = await bcrypt.compare('plainpassword', user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      await repository.create({
        username: 'findme',
        password: 'password123',
        role: 'HR_ADMIN',
      });

      const user = await repository.findByUsername('findme');

      expect(user).toBeDefined();
      expect(user?.username).toBe('findme');
    });

    it('should return null if user not found', async () => {
      const user = await repository.findByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const created = await repository.create({
        username: 'findbyid',
        password: 'password123',
        role: 'VENDOR_ADMIN',
      });

      const user = await repository.findById(created._id);

      expect(user).toBeDefined();
      expect(user?._id.toString()).toBe(created._id.toString());
      expect(user?.username).toBe('findbyid');
    });

    it('should return null if user not found', async () => {
      const user = await repository.findById('507f1f77bcf86cd799439011');
      expect(user).toBeNull();
    });
  });
});
