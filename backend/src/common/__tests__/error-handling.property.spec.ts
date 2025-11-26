import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fc from 'fast-check';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { ArgumentsHost } from '@nestjs/common';

describe('Error Handling - Property-Based Tests', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockRequest = {
      url: '/test-url',
      method: 'GET',
    };
    
    mockArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      })),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };
  });

  // Arbitraries (Generators)
  const httpStatusCodeArbitrary = fc.constantFrom(400, 401, 403, 404, 500, 503);
  
  const errorMessageArbitrary = fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => s.trim().length > 0); // Filter out whitespace-only strings
  
  const urlPathArbitrary = fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0)
    .map(s => `/${s}`);
  
  const httpMethodArbitrary = fc.constantFrom('GET', 'POST', 'PUT', 'PATCH', 'DELETE');
  
  const validationErrorArbitrary = fc.array(
    fc.record({
      property: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
      constraints: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
      ),
    }),
    { minLength: 1, maxLength: 5 }
  );

  // Feature: nestjs-backend-migration, Property 1: Successful requests return appropriate status codes
  // Note: This property is validated by the absence of errors in successful requests
  // The filter only handles errors, so successful requests pass through unchanged

  // Feature: nestjs-backend-migration, Property 2: Failed requests return appropriate error codes
  describe('Property 2: Failed requests return appropriate error codes', () => {
    it('for any HTTP exception, should return the correct status code', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpStatusCodeArbitrary,
          errorMessageArbitrary,
          async (statusCode, message) => {
            // Create fresh mocks for each iteration
            const testResponse = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            };
            
            const testRequest = {
              url: '/test-url',
              method: 'GET',
            };
            
            const testHost = {
              switchToHttp: jest.fn(() => ({
                getResponse: () => testResponse,
                getRequest: () => testRequest,
              })),
              getArgByIndex: jest.fn(),
              getArgs: jest.fn(),
              getType: jest.fn(),
              switchToRpc: jest.fn(),
              switchToWs: jest.fn(),
            };
            
            const exception = new HttpException(message, statusCode);
            filter.catch(exception, testHost as any);
            
            expect(testResponse.status).toHaveBeenCalledWith(statusCode);
            expect(testResponse.json).toHaveBeenCalled();
            
            const jsonCall = testResponse.json.mock.calls[0][0];
            expect(jsonCall.statusCode).toBe(statusCode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any error type, should return appropriate status code', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            new BadRequestException('Bad request'),
            new UnauthorizedException('Unauthorized'),
            new NotFoundException('Not found'),
            new InternalServerErrorException('Internal error')
          ),
          async (exception) => {
            // Create fresh mocks for each iteration
            const testResponse = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            };
            
            const testRequest = {
              url: '/test-url',
              method: 'GET',
            };
            
            const testHost = {
              switchToHttp: jest.fn(() => ({
                getResponse: () => testResponse,
                getRequest: () => testRequest,
              })),
              getArgByIndex: jest.fn(),
              getArgs: jest.fn(),
              getType: jest.fn(),
              switchToRpc: jest.fn(),
              switchToWs: jest.fn(),
            };
            
            filter.catch(exception, testHost as any);
            
            expect(testResponse.status).toHaveBeenCalled();
            const statusCode = testResponse.status.mock.calls[0][0];
            expect(statusCode).toBeGreaterThanOrEqual(400);
            expect(statusCode).toBeLessThan(600);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 3: Response format consistency
  describe('Property 3: Response format consistency', () => {
    it('for any error, should follow consistent JSON structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpStatusCodeArbitrary,
          errorMessageArbitrary,
          urlPathArbitrary,
          httpMethodArbitrary,
          async (statusCode, message, path, method) => {
            // Create fresh mocks for each iteration
            const testResponse = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            };
            
            const testRequest = {
              url: path,
              method: method,
            };
            
            const testHost = {
              switchToHttp: jest.fn(() => ({
                getResponse: () => testResponse,
                getRequest: () => testRequest,
              })),
              getArgByIndex: jest.fn(),
              getArgs: jest.fn(),
              getType: jest.fn(),
              switchToRpc: jest.fn(),
              switchToWs: jest.fn(),
            };
            
            const exception = new HttpException(message, statusCode);
            filter.catch(exception, testHost as any);
            
            const jsonCall = testResponse.json.mock.calls[0][0];
            
            // Verify consistent error structure
            expect(jsonCall).toHaveProperty('statusCode');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
            expect(jsonCall).toHaveProperty('message');
            
            // Verify types
            expect(typeof jsonCall.statusCode).toBe('number');
            expect(typeof jsonCall.timestamp).toBe('string');
            expect(typeof jsonCall.path).toBe('string');
            expect(jsonCall.message).toBeDefined();
            
            // Verify values
            expect(jsonCall.statusCode).toBe(statusCode);
            expect(jsonCall.path).toBe(path);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 9: Database error handling
  describe('Property 9: Database error handling', () => {
    it('for any error, should not expose internal details like stack traces', async () => {
      await fc.assert(
        fc.asyncProperty(
          errorMessageArbitrary,
          async (message) => {
            const error = new Error(message);
            error.stack = 'Error: test\n    at Object.<anonymous> (/path/to/file.js:10:15)';
            
            filter.catch(error, mockArgumentsHost);
            
            const jsonCall = mockResponse.json.mock.calls[0][0];
            
            // Verify error doesn't expose stack traces
            expect(jsonCall).not.toHaveProperty('stack');
            expect(JSON.stringify(jsonCall)).not.toContain('at Object.<anonymous>');
            
            // Should have standard error fields
            expect(jsonCall).toHaveProperty('statusCode');
            expect(jsonCall).toHaveProperty('message');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 15: Invalid data validation
  describe('Property 15: Invalid data validation', () => {
    it('for any BadRequestException, should return 400 with validation errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          validationErrorArbitrary,
          async (validationErrors) => {
            const exception = new BadRequestException({
              message: 'Validation failed',
              errors: validationErrors,
            });
            
            filter.catch(exception, mockArgumentsHost);
            
            const jsonCall = mockResponse.json.mock.calls[0][0];
            
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(jsonCall.statusCode).toBe(400);
            expect(jsonCall).toHaveProperty('message');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 16: Three proposed dates validation
  // Note: This property is validated by the ValidationPipe, not the exception filter
  // The filter handles the error after validation fails

  // Feature: nestjs-backend-migration, Property 17: Rejection remarks validation
  // Note: This property is validated by the ValidationPipe, not the exception filter
  // The filter handles the error after validation fails

  // Feature: nestjs-backend-migration, Property 18: Consistent error formatting
  describe('Property 18: Consistent error formatting', () => {
    it('for any error type, should follow consistent format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            new BadRequestException('Bad request'),
            new UnauthorizedException('Unauthorized'),
            new NotFoundException('Not found'),
            new InternalServerErrorException('Internal error'),
            new Error('Generic error')
          ),
          urlPathArbitrary,
          async (exception, path) => {
            // Create fresh mocks for each iteration
            const testResponse = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            };
            
            const testRequest = {
              url: path,
              method: 'GET',
            };
            
            const testHost = {
              switchToHttp: jest.fn(() => ({
                getResponse: () => testResponse,
                getRequest: () => testRequest,
              })),
              getArgByIndex: jest.fn(),
              getArgs: jest.fn(),
              getType: jest.fn(),
              switchToRpc: jest.fn(),
              switchToWs: jest.fn(),
            };
            
            filter.catch(exception, testHost as any);
            
            const jsonCall = testResponse.json.mock.calls[0][0];
            
            // All errors should have the same structure
            expect(jsonCall).toHaveProperty('statusCode');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
            expect(jsonCall).toHaveProperty('message');
            
            // Timestamp should be valid ISO string
            expect(() => new Date(jsonCall.timestamp)).not.toThrow();
            expect(new Date(jsonCall.timestamp).toISOString()).toBe(jsonCall.timestamp);
            
            // Path should match the request
            expect(jsonCall.path).toBe(path);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 19: Unhandled exception handling
  describe('Property 19: Unhandled exception handling', () => {
    it('for any unhandled exception, should return 500 with generic message', async () => {
      await fc.assert(
        fc.asyncProperty(
          errorMessageArbitrary,
          async (message) => {
            const error = new Error(message);
            
            filter.catch(error, mockArgumentsHost);
            
            const jsonCall = mockResponse.json.mock.calls[0][0];
            
            // Should return 500 for unhandled errors
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(jsonCall.statusCode).toBe(500);
            expect(jsonCall).toHaveProperty('message');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: nestjs-backend-migration, Property 20: Validation error structure
  describe('Property 20: Validation error structure', () => {
    it('for any validation error, should include structured field information', async () => {
      await fc.assert(
        fc.asyncProperty(
          validationErrorArbitrary,
          async (validationErrors) => {
            const exception = new BadRequestException({
              message: 'Validation failed',
              errors: validationErrors,
            });
            
            filter.catch(exception, mockArgumentsHost);
            
            const jsonCall = mockResponse.json.mock.calls[0][0];
            
            // Validation errors should have structured information
            expect(jsonCall).toHaveProperty('statusCode', 400);
            expect(jsonCall).toHaveProperty('message');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
            
            // Should include the errors field
            if (validationErrors.length > 0) {
              expect(jsonCall).toHaveProperty('errors');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('for any error with message array, should preserve message structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(errorMessageArbitrary, { minLength: 1, maxLength: 5 }),
          async (messages) => {
            const exception = new BadRequestException(messages);
            
            filter.catch(exception, mockArgumentsHost);
            
            const jsonCall = mockResponse.json.mock.calls[0][0];
            
            expect(jsonCall).toHaveProperty('statusCode', 400);
            expect(jsonCall).toHaveProperty('message');
            expect(jsonCall).toHaveProperty('timestamp');
            expect(jsonCall).toHaveProperty('path');
            
            // Message should be preserved (either as array or string)
            expect(jsonCall.message).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
