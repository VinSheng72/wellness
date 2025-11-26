import 'reflect-metadata';
import * as fc from 'fast-check';
import { validate } from '../env.validation';

describe('Configuration Validation Property Tests', () => {
  // Feature: nestjs-backend-migration, Property: Configuration validation at startup
  // Validates: Requirements 10.2, 10.3
  describe('Property: Configuration validation at startup', () => {
    it('should accept valid configuration with all required fields', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.integer({ min: 1000, max: 65535 }),
          (databaseUrl, jwtSecret, jwtRefreshSecret, frontendUrl, port) => {
            const config = {
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              FRONTEND_URL: frontendUrl,
              PORT: port.toString(),
              NODE_ENV: 'development',
              JWT_ACCESS_TOKEN_EXPIRATION: '15m',
              JWT_REFRESH_TOKEN_EXPIRATION: '7d',
              API_PREFIX: 'api/v1',
              SWAGGER_ENABLED: 'true',
              SWAGGER_PATH: 'api/docs',
              LOG_LEVEL: 'info',
            };

            // Should not throw an error
            expect(() => validate(config)).not.toThrow();

            const result = validate(config);
            expect(result.DATABASE_URL).toBe(databaseUrl);
            expect(result.JWT_SECRET).toBe(jwtSecret);
            expect(result.JWT_REFRESH_SECRET).toBe(jwtRefreshSecret);
            expect(result.FRONTEND_URL).toBe(frontendUrl);
            expect(result.PORT).toBe(port);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject configuration missing DATABASE_URL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (jwtSecret, frontendUrl) => {
            const config = {
              // DATABASE_URL is missing
              JWT_SECRET: jwtSecret,
              FRONTEND_URL: frontendUrl,
              PORT: '3001',
            };

            expect(() => validate(config)).toThrow(/DATABASE_URL/);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject configuration missing JWT_SECRET', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (databaseUrl, jwtRefreshSecret, frontendUrl) => {
            const config = {
              DATABASE_URL: databaseUrl,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              // JWT_SECRET is missing
              FRONTEND_URL: frontendUrl,
              PORT: '3001',
            };

            expect(() => validate(config)).toThrow(/JWT_SECRET/);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject configuration missing FRONTEND_URL', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          (databaseUrl, jwtSecret, jwtRefreshSecret) => {
            const config = {
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              // FRONTEND_URL is missing
              PORT: '3001',
            };

            expect(() => validate(config)).toThrow(/FRONTEND_URL/);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject configuration with empty required fields', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL'),
          (fieldToEmpty) => {
            const config = {
              DATABASE_URL: 'mongodb://localhost:27017/test',
              JWT_SECRET: 'test-secret-key-with-sufficient-length',
              JWT_REFRESH_SECRET: 'test-refresh-secret-key-with-sufficient-length',
              FRONTEND_URL: 'http://localhost:3000',
              PORT: '3001',
            };

            // Set the selected field to empty string
            config[fieldToEmpty] = '';

            expect(() => validate(config)).toThrow(new RegExp(fieldToEmpty));
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should use default values for optional fields', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (databaseUrl, jwtSecret, jwtRefreshSecret, frontendUrl) => {
            const config = {
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              FRONTEND_URL: frontendUrl,
              // Optional fields are omitted
            };

            const result = validate(config);

            // Check that defaults are applied
            expect(result.NODE_ENV).toBe('development');
            expect(result.PORT).toBe(3001);
            expect(result.JWT_EXPIRATION).toBe('15m');
            expect(result.JWT_REFRESH_EXPIRATION).toBe('7d');
            expect(result.API_PREFIX).toBe('api/v1');
            expect(result.SWAGGER_ENABLED).toBe(true);
            expect(result.SWAGGER_PATH).toBe('api/docs');
            expect(result.LOG_LEVEL).toBe('info');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept valid NODE_ENV values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('development', 'production', 'test'),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (nodeEnv, databaseUrl, jwtSecret, jwtRefreshSecret, frontendUrl) => {
            const config = {
              NODE_ENV: nodeEnv,
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              FRONTEND_URL: frontendUrl,
              PORT: '3001',
            };

            const result = validate(config);
            expect(result.NODE_ENV).toBe(nodeEnv);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should convert PORT to number', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 65535 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (port, databaseUrl, jwtSecret, jwtRefreshSecret, frontendUrl) => {
            const config = {
              PORT: port.toString(),
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              FRONTEND_URL: frontendUrl,
            };

            const result = validate(config);
            expect(result.PORT).toBe(port);
            expect(typeof result.PORT).toBe('number');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should convert SWAGGER_ENABLED to boolean', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.string({ minLength: 32, maxLength: 64 }),
          fc.webUrl({ withFragments: false, withQueryParameters: false }),
          (swaggerEnabled, databaseUrl, jwtSecret, jwtRefreshSecret, frontendUrl) => {
            const config = {
              SWAGGER_ENABLED: swaggerEnabled.toString(),
              DATABASE_URL: databaseUrl,
              JWT_SECRET: jwtSecret,
              JWT_REFRESH_SECRET: jwtRefreshSecret,
              FRONTEND_URL: frontendUrl,
              PORT: '3001',
            };

            const result = validate(config);
            expect(result.SWAGGER_ENABLED).toBe(swaggerEnabled);
            expect(typeof result.SWAGGER_ENABLED).toBe('boolean');
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
