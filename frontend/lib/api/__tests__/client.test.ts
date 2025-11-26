/**
 * Integration tests for API Client
 * Tests login flow, token refresh, and error handling
 */

import { apiClient } from '../client';
import { AuthResponse } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Reset API client state
    apiClient.clearTokens();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '123',
          username: 'testuser',
          role: 'HR_ADMIN',
          companyId: 'company123',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiClient.login('testuser', 'password123');

      expect(result).toEqual(mockResponse);
      expect(apiClient.getToken()).toBe('mock-access-token');
      expect(apiClient.getRefreshToken()).toBe('mock-refresh-token');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        })
      );
    });

    it('should throw error on invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          statusCode: 401,
          message: 'Invalid credentials',
        }),
      });

      await expect(apiClient.login('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('token refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Set initial tokens
      apiClient.setToken('old-access-token');
      apiClient.setRefreshToken('valid-refresh-token');

      const mockResponse: AuthResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          username: 'testuser',
          role: 'HR_ADMIN',
          companyId: 'company123',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual(mockResponse);
      expect(apiClient.getToken()).toBe('new-access-token');
      expect(apiClient.getRefreshToken()).toBe('new-refresh-token');
    });

    it('should throw error when no refresh token available', async () => {
      await expect(apiClient.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('should automatically refresh token on 401 response', async () => {
      // Set initial tokens
      apiClient.setToken('expired-access-token');
      apiClient.setRefreshToken('valid-refresh-token');

      // First call returns 401
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Unauthorized' }),
      });

      // Refresh token call succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: { id: '123', username: 'testuser', role: 'HR_ADMIN' },
        }),
      });

      // Retry original request succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ _id: '1', status: 'Pending' }],
      });

      const result = await apiClient.getEvents();

      expect(result).toEqual([{ _id: '1', status: 'Pending' }]);
      expect(apiClient.getToken()).toBe('new-access-token');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('API error handling', () => {
    beforeEach(() => {
      apiClient.setToken('valid-token');
    });

    it('should handle 400 Bad Request errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          statusCode: 400,
          message: 'Validation failed',
          errors: [{ field: 'proposedDates', message: 'Must have exactly 3 dates' }],
        }),
      });

      await expect(
        apiClient.createEvent({
          eventItemId: '123',
          proposedDates: ['2024-01-01'],
          location: { postalCode: '12345', streetName: 'Main St' },
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should handle 403 Forbidden errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          statusCode: 403,
          message: 'Insufficient permissions',
        }),
      });

      await expect(apiClient.approveEvent('event123', '2024-01-01')).rejects.toThrow(
        'Insufficient permissions'
      );
    });

    it('should handle 404 Not Found errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          statusCode: 404,
          message: 'Event not found',
        }),
      });

      await expect(apiClient.getEvent('nonexistent')).rejects.toThrow('Event not found');
    });

    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          statusCode: 500,
          message: 'Internal server error',
        }),
      });

      await expect(apiClient.getEvents()).rejects.toThrow('Internal server error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getEvents()).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      apiClient.setToken('access-token');
      apiClient.setRefreshToken('refresh-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      await apiClient.logout();

      expect(apiClient.getToken()).toBeNull();
      expect(apiClient.getRefreshToken()).toBeNull();
    });

    it('should clear tokens even if logout request fails', async () => {
      apiClient.setToken('access-token');
      apiClient.setRefreshToken('refresh-token');

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await apiClient.logout();

      expect(apiClient.getToken()).toBeNull();
      expect(apiClient.getRefreshToken()).toBeNull();
    });
  });

  describe('event operations', () => {
    beforeEach(() => {
      apiClient.setToken('valid-token');
    });

    it('should get all events', async () => {
      const mockEvents = [
        { _id: '1', status: 'Pending', companyId: 'company1' },
        { _id: '2', status: 'Approved', companyId: 'company1' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockEvents,
      });

      const result = await apiClient.getEvents();

      expect(result).toEqual(mockEvents);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('should create an event', async () => {
      const eventData = {
        eventItemId: '123',
        proposedDates: ['2024-01-01', '2024-01-02', '2024-01-03'],
        location: { postalCode: '12345', streetName: 'Main St' },
      };

      const mockResponse = {
        _id: 'event123',
        ...eventData,
        status: 'Pending',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiClient.createEvent(eventData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(eventData),
        })
      );
    });

    it('should approve an event', async () => {
      const mockResponse = {
        _id: 'event123',
        status: 'Approved',
        confirmedDate: '2024-01-01',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiClient.approveEvent('event123', '2024-01-01');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/event123/approve'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ confirmedDate: '2024-01-01' }),
        })
      );
    });

    it('should reject an event', async () => {
      const mockResponse = {
        _id: 'event123',
        status: 'Rejected',
        remarks: 'Not available',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiClient.rejectEvent('event123', 'Not available');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events/event123/reject'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ remarks: 'Not available' }),
        })
      );
    });

    it('should get event items', async () => {
      const mockItems = [
        { _id: '1', name: 'Yoga Class', vendorId: 'vendor1' },
        { _id: '2', name: 'Meditation', vendorId: 'vendor2' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockItems,
      });

      const result = await apiClient.getEventItems();

      expect(result).toEqual(mockItems);
    });
  });

  describe('postal code lookup', () => {
    beforeEach(() => {
      apiClient.setToken('valid-token');
    });

    it('should return street name on successful lookup', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ streetName: 'Main Street' }),
      });

      const result = await apiClient.lookupPostalCode('12345');

      expect(result).toEqual({ streetName: 'Main Street' });
    });

    it('should return null on failed lookup', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      });

      const result = await apiClient.lookupPostalCode('99999');

      expect(result).toBeNull();
    });
  });
});
