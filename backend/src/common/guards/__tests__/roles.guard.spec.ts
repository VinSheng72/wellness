import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext({
        id: '123',
        role: 'HR_ADMIN',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['HR_ADMIN']);

      const context = createMockExecutionContext({
        id: '123',
        role: 'HR_ADMIN',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['VENDOR_ADMIN']);

      const context = createMockExecutionContext({
        id: '123',
        role: 'HR_ADMIN',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['HR_ADMIN', 'VENDOR_ADMIN']);

      const context = createMockExecutionContext({
        id: '123',
        role: 'VENDOR_ADMIN',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user has none of the required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['HR_ADMIN', 'VENDOR_ADMIN']);

      const context = createMockExecutionContext({
        id: '123',
        role: 'UNKNOWN_ROLE',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
