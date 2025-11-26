import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as fc from 'fast-check';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RolesGuard } from '../roles.guard';

describe('Authorization Property-Based Tests', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let rolesGuard: RolesGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        RolesGuard,
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
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRATION') return '15m';
              return null;
            }),
          },
        },
        Reflector,
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  // Generators
  const userArbitrary = fc.record({
    id: fc.uuid(),
    username: fc.string({ minLength: 3, maxLength: 20 }),
    role: fc.constantFrom('HR_ADMIN', 'VENDOR_ADMIN'),
    companyId: fc.option(fc.uuid(), { nil: undefined }),
    vendorId: fc.option(fc.uuid(), { nil: undefined }),
  });

  const roleArbitrary = fc.constantFrom('HR_ADMIN', 'VENDOR_ADMIN');

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('Property 5: Token validation on authenticated requests', () => {
    /**
     * Feature: nestjs-backend-migration, Property 5: Token validation on authenticated requests
     * Validates: Requirements 3.2
     */
    it('should reject requests without valid user', () => {
      fc.assert(
        fc.property(fc.constant(null), (user) => {
          expect(() => {
            jwtAuthGuard.handleRequest(null, user, null);
          }).toThrow(UnauthorizedException);
        }),
        { numRuns: 100 },
      );
    });

    it('should accept requests with valid user object', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          const result = jwtAuthGuard.handleRequest(null, user, null);
          expect(result).toEqual(user);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 6: Invalid token rejection', () => {
    /**
     * Feature: nestjs-backend-migration, Property 6: Invalid token rejection
     * Validates: Requirements 3.3
     */
    it('should throw UnauthorizedException for any error during authentication', () => {
      const errorArbitrary = fc.oneof(
        fc.constant(new Error('Token expired')),
        fc.constant(new Error('Invalid token')),
        fc.constant(new Error('Malformed token')),
        fc.constant(new UnauthorizedException('Custom auth error')),
      );

      fc.assert(
        fc.property(errorArbitrary, (error) => {
          expect(() => {
            jwtAuthGuard.handleRequest(error, null, null);
          }).toThrow();
        }),
        { numRuns: 100 },
      );
    });

    it('should throw UnauthorizedException when user is missing regardless of info', () => {
      const infoArbitrary = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant({ message: 'No auth token' }),
        fc.constant({ message: 'Token expired' }),
      );

      fc.assert(
        fc.property(infoArbitrary, (info) => {
          expect(() => {
            jwtAuthGuard.handleRequest(null, null, info);
          }).toThrow(UnauthorizedException);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 7: Role-based access control', () => {
    /**
     * Feature: nestjs-backend-migration, Property 7: Role-based access control
     * Validates: Requirements 3.4
     */
    it('should allow access when user role matches any required role', () => {
      fc.assert(
        fc.property(
          userArbitrary,
          fc.array(roleArbitrary, { minLength: 1, maxLength: 2 }),
          (user, requiredRoles) => {
            // Ensure user has one of the required roles
            const userWithMatchingRole = {
              ...user,
              role: requiredRoles[0],
            };

            jest
              .spyOn(reflector, 'getAllAndOverride')
              .mockReturnValue(requiredRoles);

            const context = createMockExecutionContext(userWithMatchingRole);
            const result = rolesGuard.canActivate(context);

            expect(result).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should deny access when user role does not match required roles', () => {
      fc.assert(
        fc.property(userArbitrary, roleArbitrary, (user, requiredRole) => {
          // Ensure user does NOT have the required role
          const oppositeRole =
            requiredRole === 'HR_ADMIN' ? 'VENDOR_ADMIN' : 'HR_ADMIN';
          const userWithDifferentRole = {
            ...user,
            role: oppositeRole,
          };

          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([requiredRole]);

          const context = createMockExecutionContext(userWithDifferentRole);
          const result = rolesGuard.canActivate(context);

          expect(result).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it('should always allow access when no roles are required', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

          const context = createMockExecutionContext(user);
          const result = rolesGuard.canActivate(context);

          expect(result).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should correctly handle multiple required roles', () => {
      const bothRoles = ['HR_ADMIN', 'VENDOR_ADMIN'];

      fc.assert(
        fc.property(userArbitrary, (user) => {
          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue(bothRoles);

          const context = createMockExecutionContext(user);
          const result = rolesGuard.canActivate(context);

          // Should allow if user has either role
          const shouldAllow = bothRoles.includes(user.role);
          expect(result).toBe(shouldAllow);
        }),
        { numRuns: 100 },
      );
    });
  });
});
