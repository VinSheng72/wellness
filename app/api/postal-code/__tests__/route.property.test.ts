import { GET } from '../[code]/route';
import { NextRequest } from 'next/server';
import fc from 'fast-check';
import LocationService from '@/lib/services/LocationService';

// Mock LocationService
jest.mock('@/lib/services/LocationService', () => ({
  __esModule: true,
  default: {
    lookupPostalCode: jest.fn(),
  },
}));

const mockLocationService = LocationService as jest.Mocked<typeof LocationService>;

describe('Postal Code API Route - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Feature: wellness-event-booking, Property 19: Postal code lookup integration
  test('Property 19: For any valid postal code, if lookup returns street name, both should be stored', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // postal code
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // street name
        async (postalCode, streetName) => {
          // Mock the service to return a street name
          mockLocationService.lookupPostalCode.mockResolvedValue({ streetName });

          // Create mock request
          const request = new NextRequest('http://localhost:3000/api/postal-code/' + postalCode);
          const params = { code: postalCode };

          // Call the API route
          const response = await GET(request, { params });
          const data = await response.json();

          // Verify the response contains the street name
          expect(data.streetName).toBe(streetName);
          expect(mockLocationService.lookupPostalCode).toHaveBeenCalledWith(postalCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 19: For any postal code, if lookup fails, API should return null gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        async (postalCode) => {
          // Mock the service to return null (lookup failed)
          mockLocationService.lookupPostalCode.mockResolvedValue(null);

          // Create mock request
          const request = new NextRequest('http://localhost:3000/api/postal-code/' + postalCode);
          const params = { code: postalCode };

          // Call the API route
          const response = await GET(request, { params });
          const data = await response.json();

          // Verify the response returns null
          expect(data.streetName).toBeNull();
          expect(response.status).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 19: For any postal code, if lookup throws error, API should handle gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        async (postalCode) => {
          // Mock the service to throw an error
          mockLocationService.lookupPostalCode.mockRejectedValue(new Error('External API error'));

          // Create mock request
          const request = new NextRequest('http://localhost:3000/api/postal-code/' + postalCode);
          const params = { code: postalCode };

          // Call the API route
          const response = await GET(request, { params });
          const data = await response.json();

          // Verify the response returns null (graceful fallback)
          expect(data.streetName).toBeNull();
          expect(response.status).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });
});
