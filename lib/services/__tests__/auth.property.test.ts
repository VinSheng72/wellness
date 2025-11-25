import fc from 'fast-check';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../db';
import AuthService from '../AuthService';
import User, { UserRole } from '../../models/User';
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
  await User.deleteMany({});
  await Company.deleteMany({});
  await Vendor.deleteMany({});
});

// Generators for property-based testing

/**
 * Generate valid username strings
 */
const usernameArbitrary = fc.string({ minLength: 3, maxLength: 50 }).filter(
  (s) => s.trim().length >= 3
);

/**
 * Generate valid password strings
 */
const passwordArbitrary = fc.string({ minLength: 6, maxLength: 100 });

/**
 * Generate user role
 */
const roleArbitrary = fc.constantFrom(UserRole.HR_ADMIN, UserRole.VENDOR_ADMIN);

/**
 * Generate a complete user with valid credentials
 */
const validUserArbitrary = fc
  .record({
    username: usernameArbitrary,
    password: passwordArbitrary,
    role: roleArbitrary,
  })
  .chain((base) => {
    if (base.role === UserRole.HR_ADMIN) {
      return fc.constant({
        username: base.username,
        password: base.password,
        role: base.role,
        companyId: new mongoose.Types.ObjectId(),
      });
    } else {
      return fc.constant({
        username: base.username,
        password: base.password,
        role: base.role,
        vendorId: new mongoose.Types.ObjectId(),
      });
    }
  });

describe('Authentication Property Tests', () => {
  // Feature: wellness-event-booking, Property 1: Role-based authentication routing
  describe('Property 1: Role-based authentication routing', () => {
    it(
      'should authenticate valid users and provide correct role information',
      async () => {
        await fc.assert(
          fc.asyncProperty(validUserArbitrary, async (userData) => {
            // Clean up any existing user with same username first
            await User.deleteOne({ username: userData.username });

            // Create user in database
            const createdUser = await User.create(userData);

            // Attempt login with correct credentials
            const result = await AuthService.login(userData.username, userData.password);

            // Verify user is returned
            expect(result.user).toBeDefined();
            // Username is trimmed by the schema
            expect(result.user.username).toBe(userData.username.trim());
            expect(result.user.role).toBe(userData.role);

            // Verify role-specific fields
            if (userData.role === UserRole.HR_ADMIN) {
              expect(result.user.companyId).toBeDefined();
              expect(result.user.vendorId).toBeUndefined();
            } else if (userData.role === UserRole.VENDOR_ADMIN) {
              expect(result.user.vendorId).toBeDefined();
              expect(result.user.companyId).toBeUndefined();
            }

            // Create session token
            const token = AuthService.createSessionToken(result.user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            // Verify session token contains correct role
            const session = await AuthService.verifySession(token);
            expect(session).not.toBeNull();
            expect(session?.role).toBe(userData.role);

            // Clean up
            await User.findByIdAndDelete(createdUser._id);
          }),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  // Feature: wellness-event-booking, Property 2: Invalid credentials rejection
  describe('Property 2: Invalid credentials rejection', () => {
    it(
      'should reject authentication with invalid username',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            validUserArbitrary,
            usernameArbitrary,
            async (userData, wrongUsername) => {
              // Ensure wrong username is different from correct one
              fc.pre(wrongUsername !== userData.username);

              // Clean up any existing user with same username first
              await User.deleteOne({ username: userData.username });

              // Create user in database
              const createdUser = await User.create(userData);

              // Attempt login with wrong username
              await expect(
                AuthService.login(wrongUsername, userData.password)
              ).rejects.toThrow('Invalid username or password');

              // Clean up
              await User.findByIdAndDelete(createdUser._id);
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );

    it(
      'should reject authentication with invalid password',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            validUserArbitrary,
            passwordArbitrary,
            async (userData, wrongPassword) => {
              // Ensure wrong password is different from correct one
              fc.pre(wrongPassword !== userData.password);

              // Clean up any existing user with same username first
              await User.deleteOne({ username: userData.username });

              // Create user in database
              const createdUser = await User.create(userData);

              // Attempt login with wrong password
              await expect(
                AuthService.login(userData.username, wrongPassword)
              ).rejects.toThrow('Invalid username or password');

              // Clean up
              await User.findByIdAndDelete(createdUser._id);
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );

    it(
      'should reject authentication for non-existent users',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            usernameArbitrary,
            passwordArbitrary,
            async (username, password) => {
              // Ensure user doesn't exist
              const existingUser = await User.findOne({ username });
              fc.pre(existingUser === null);

              // Attempt login with non-existent user
              await expect(AuthService.login(username, password)).rejects.toThrow(
                'Invalid username or password'
              );
            }
          ),
          { numRuns: 20 }
        );
      },
      30000
    );
  });

  describe('Session Token Verification', () => {
    it(
      'should verify valid session tokens',
      async () => {
        await fc.assert(
          fc.asyncProperty(validUserArbitrary, async (userData) => {
            // Clean up any existing user with same username first
            await User.deleteOne({ username: userData.username });

            // Create user in database
            const createdUser = await User.create(userData);

            // Login and create token
            const { user } = await AuthService.login(userData.username, userData.password);
            const token = AuthService.createSessionToken(user);

            // Verify token
            const session = await AuthService.verifySession(token);

            expect(session).not.toBeNull();
            // Username is trimmed by the schema
            expect(session?.username).toBe(userData.username.trim());
            expect(session?.role).toBe(userData.role);

            // Clean up
            await User.findByIdAndDelete(createdUser._id);
          }),
          { numRuns: 20 }
        );
      },
      30000
    );

    it('should reject invalid session tokens', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (invalidToken) => {
          // Attempt to verify invalid token
          const session = await AuthService.verifySession(invalidToken);

          // Should return null for invalid tokens
          expect(session).toBeNull();
        }),
        { numRuns: 20 }
      );
    });
  });
});
