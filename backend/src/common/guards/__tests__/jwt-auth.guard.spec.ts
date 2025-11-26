import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const user = {
        id: '123',
        username: 'testuser',
        role: 'HR_ADMIN',
      };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user is not provided', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with custom message', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error when error is provided', () => {
      const error = new Error('Token expired');

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(error);
    });

    it('should prioritize error over missing user', () => {
      const error = new Error('Custom error');

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(error);
    });
  });
});
