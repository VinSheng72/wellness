import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../users/users.repository';
import { Types } from 'mongoose';

// Mock bcrypt at the module level
jest.mock('bcrypt');

describe('AuthService - Property-Based Tests', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION: '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  // Arbitraries (Generators)
  const userArbitrary = fc.record({
    _id: fc.constant(new Types.ObjectId()),
    username: fc.string({ minLength: 3, maxLength: 20 }),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    role: fc.constantFrom('HR_ADMIN', 'VENDOR_ADMIN'),
    companyId: fc.option(fc.constant(new Types.ObjectId()), { nil: undefined }),
    vendorId: fc.option(fc.constant(new Types.ObjectId()), { nil: undefined }),
  });

  const credentialsArbitrary = fc.record({
    username: fc.string({ minLength: 3, maxLength: 20 }),
    password: fc.string({ minLength: 8, maxLength: 50 }),
  });

  const tokenArbitrary = fc.string({ minLength: 20, maxLength: 200 });

  // Feature: nestjs-backend-migration, Property 4: Valid credentials return tokens
  describe('Property 4: Valid credentials return tokens', () => {
    it('for any valid user credentials, login should return both access and refresh tokens', async () => {
      await fc.assert(
        fc.asyncProperty(userArbitrary, credentialsArbitrary, async (user, credentials) => {
          // Setup: Mock user exists and password matches
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const userWithHashedPassword = { ...user, password: hashedPassword } as any;
          
          usersRepository.findByUsername.mockResolvedValue(userWithHashedPassword);
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);
          jwtService.sign
            .mockReturnValueOnce('mock-access-token')
            .mockReturnValueOnce('mock-refresh-token');

          // Execute
          const result = await service.login({
            username: credentials.username,
            password: credentials.password,
          });

          // Verify: Response contains both tokens
          expect(result).toHaveProperty('accessToken');
          expect(result).toHaveProperty('refreshToken');
          expect(result.accessToken).toBeTruthy();
          expect(result.refreshToken).toBeTruthy();
          expect(typeof result.accessToken).toBe('string');
          expect(typeof result.refreshToken).toBe('string');
          
          // Verify: Response contains user information
          expect(result).toHaveProperty('user');
          expect(result.user).toHaveProperty('id');
          expect(result.user).toHaveProperty('username');
          expect(result.user).toHaveProperty('role');
          expect(result.user.role).toMatch(/^(HR_ADMIN|VENDOR_ADMIN)$/);
        }),
        { numRuns: 100 }
      );
    });

    it('for any valid user, the returned user data should match the authenticated user', async () => {
      await fc.assert(
        fc.asyncProperty(userArbitrary, async (user) => {
          // Setup
          usersRepository.findByUsername.mockResolvedValue(user as any);
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);
          jwtService.sign
            .mockReturnValueOnce('mock-access-token')
            .mockReturnValueOnce('mock-refresh-token');

          // Execute
          const result = await service.login({
            username: user.username,
            password: 'any-password',
          });

          // Verify: User data matches
          expect(result.user.username).toBe(user.username);
          expect(result.user.role).toBe(user.role);
          expect(result.user.id).toBe(user._id.toString());
          
          if (user.companyId) {
            expect(result.user.companyId).toBe(user.companyId.toString());
          }
          if (user.vendorId) {
            expect(result.user.vendorId).toBe(user.vendorId.toString());
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 8: Token refresh round-trip
  describe('Property 8: Token refresh round-trip', () => {
    it('for any valid refresh token, refreshing should return new valid tokens', async () => {
      await fc.assert(
        fc.asyncProperty(userArbitrary, tokenArbitrary, async (user, refreshToken) => {
          // Setup: Mock token verification and user lookup
          const payload = {
            sub: user._id.toString(),
            username: user.username,
            role: user.role,
          };
          
          jwtService.verify.mockReturnValue(payload);
          usersRepository.findById.mockResolvedValue(user as any);
          jwtService.sign
            .mockReturnValueOnce('new-access-token')
            .mockReturnValueOnce('new-refresh-token');

          // Execute
          const result = await service.refreshToken(refreshToken);

          // Verify: New tokens are returned
          expect(result).toHaveProperty('accessToken');
          expect(result).toHaveProperty('refreshToken');
          expect(result.accessToken).toBeTruthy();
          expect(result.refreshToken).toBeTruthy();
          expect(typeof result.accessToken).toBe('string');
          expect(typeof result.refreshToken).toBe('string');
          
          // Verify: User data is preserved
          expect(result.user.id).toBe(user._id.toString());
          expect(result.user.username).toBe(user.username);
          expect(result.user.role).toBe(user.role);
        }),
        { numRuns: 100 }
      );
    });

    it('for any user, multiple token refreshes should maintain user identity', async () => {
      await fc.assert(
        fc.asyncProperty(
          userArbitrary,
          fc.array(tokenArbitrary, { minLength: 2, maxLength: 5 }),
          async (user, refreshTokens) => {
            // Setup
            const payload = {
              sub: user._id.toString(),
              username: user.username,
              role: user.role,
            };
            
            jwtService.verify.mockReturnValue(payload);
            usersRepository.findById.mockResolvedValue(user as any);

            // Execute: Refresh multiple times
            const results = [];
            for (const token of refreshTokens) {
              jwtService.sign
                .mockReturnValueOnce(`access-${token}`)
                .mockReturnValueOnce(`refresh-${token}`);
              
              const result = await service.refreshToken(token);
              results.push(result);
            }

            // Verify: All refreshes maintain the same user identity
            for (const result of results) {
              expect(result.user.id).toBe(user._id.toString());
              expect(result.user.username).toBe(user.username);
              expect(result.user.role).toBe(user.role);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any user, refresh token should preserve all user properties', async () => {
      await fc.assert(
        fc.asyncProperty(userArbitrary, tokenArbitrary, async (user, refreshToken) => {
          // Setup
          const payload = {
            sub: user._id.toString(),
            username: user.username,
            role: user.role,
            companyId: user.companyId?.toString(),
            vendorId: user.vendorId?.toString(),
          };
          
          jwtService.verify.mockReturnValue(payload);
          usersRepository.findById.mockResolvedValue(user as any);
          jwtService.sign
            .mockReturnValueOnce('new-access-token')
            .mockReturnValueOnce('new-refresh-token');

          // Execute
          const result = await service.refreshToken(refreshToken);

          // Verify: All user properties are preserved
          expect(result.user.id).toBe(user._id.toString());
          expect(result.user.username).toBe(user.username);
          expect(result.user.role).toBe(user.role);
          
          if (user.companyId) {
            expect(result.user.companyId).toBe(user.companyId.toString());
          } else {
            expect(result.user.companyId).toBeUndefined();
          }
          
          if (user.vendorId) {
            expect(result.user.vendorId).toBe(user.vendorId.toString());
          } else {
            expect(result.user.vendorId).toBeUndefined();
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
