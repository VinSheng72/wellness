import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../db';
import User, { UserRole, IUser } from '../User';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  // Use existing database connection
  await connectDB();
});

afterAll(async () => {
  // Clean up and disconnect
  await disconnectDB();
});

afterEach(async () => {
  // Clean up database between tests
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid HR_ADMIN user', async () => {
      const companyId = new mongoose.Types.ObjectId();
      const userData = {
        username: 'hradmin',
        password: 'password123',
        role: UserRole.HR_ADMIN,
        companyId,
      };

      const user = await User.create(userData);

      expect(user.username).toBe('hradmin');
      expect(user.role).toBe(UserRole.HR_ADMIN);
      expect(user.companyId).toEqual(companyId);
      expect(user.vendorId).toBeUndefined();
      expect(user.password).not.toBe('password123'); // Should be hashed
    });

    it('should create a valid VENDOR_ADMIN user', async () => {
      const vendorId = new mongoose.Types.ObjectId();
      const userData = {
        username: 'vendoradmin',
        password: 'password123',
        role: UserRole.VENDOR_ADMIN,
        vendorId,
      };

      const user = await User.create(userData);

      expect(user.username).toBe('vendoradmin');
      expect(user.role).toBe(UserRole.VENDOR_ADMIN);
      expect(user.vendorId).toEqual(vendorId);
      expect(user.companyId).toBeUndefined();
      expect(user.password).not.toBe('password123'); // Should be hashed
    });

    it('should enforce unique username constraint', async () => {
      const companyId = new mongoose.Types.ObjectId();
      await User.create({
        username: 'duplicate',
        password: 'password123',
        role: UserRole.HR_ADMIN,
        companyId,
      });

      await expect(
        User.create({
          username: 'duplicate',
          password: 'password456',
          role: UserRole.HR_ADMIN,
          companyId,
        })
      ).rejects.toThrow();
    });

    it('should require username', async () => {
      const companyId = new mongoose.Types.ObjectId();
      const userData = {
        password: 'password123',
        role: UserRole.HR_ADMIN,
        companyId,
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password', async () => {
      const companyId = new mongoose.Types.ObjectId();
      const userData = {
        username: 'testuser',
        role: UserRole.HR_ADMIN,
        companyId,
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require role', async () => {
      const companyId = new mongoose.Types.ObjectId();
      const userData = {
        username: 'testuser',
        password: 'password123',
        companyId,
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require companyId for HR_ADMIN', async () => {
      const userData = {
        username: 'hradmin',
        password: 'password123',
        role: UserRole.HR_ADMIN,
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require vendorId for VENDOR_ADMIN', async () => {
      const userData = {
        username: 'vendoradmin',
        password: 'password123',
        role: UserRole.VENDOR_ADMIN,
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const companyId = new mongoose.Types.ObjectId();
      const plainPassword = 'password123';
      
      const user = await User.create({
        username: 'testuser',
        password: plainPassword,
        role: UserRole.HR_ADMIN,
        companyId,
      });

      // Password should be hashed
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);

      // Verify the hash is valid
      const isMatch = await bcrypt.compare(plainPassword, user.password);
      expect(isMatch).toBe(true);
    });

    it('should not rehash password if not modified', async () => {
      const companyId = new mongoose.Types.ObjectId();
      
      const user = await User.create({
        username: 'testuser',
        password: 'password123',
        role: UserRole.HR_ADMIN,
        companyId,
      });

      const originalHash = user.password;

      // Update a different field
      user.username = 'updateduser';
      await user.save();

      // Password hash should remain the same
      expect(user.password).toBe(originalHash);
    });
  });

  describe('Indexes', () => {
    it('should have unique index on username', async () => {
      const indexes = await User.collection.getIndexes();
      
      // Check that username index exists
      const hasUsernameIndex = Object.keys(indexes).some(
        (key) => key.includes('username')
      );
      
      expect(hasUsernameIndex).toBe(true);
    });
  });
});
