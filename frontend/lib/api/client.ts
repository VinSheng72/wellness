/**
 * API Client for communicating with the NestJS backend
 */

import {
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  CreateEventRequest,
  ApproveEventRequest,
  RejectEventRequest,
  EventResponse,
  EventItemResponse,
  ApiError,
} from './types';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Set the access token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  /**
   * Get the current access token
   */
  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    return this.token;
  }

  /**
   * Set the refresh token
   */
  setRefreshToken(token: string): void {
    this.refreshToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Make an HTTP request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          // Retry original request with new token
          const newToken = this.getToken();
          const retryHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
          };
          if (newToken) {
            retryHeaders['Authorization'] = `Bearer ${newToken}`;
          }
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });
          return this.handleResponse<T>(retryResponse);
        } else {
          // Refresh failed, redirect to login
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Handle the response from the API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Request failed');
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    if (isJson) {
      return response.json();
    }

    return undefined as T;
  }

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(): Promise<boolean> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start refreshing
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data: AuthResponse = await response.json();
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    this.setToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);

    return data;
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
    });

    this.setToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);

    return data;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get all events (filtered by user role on backend)
   */
  async getEvents(): Promise<EventResponse[]> {
    return this.request<EventResponse[]>('/events', {
      method: 'GET',
    });
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
    return this.request<EventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Approve an event
   */
  async approveEvent(id: string, confirmedDate: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ confirmedDate } as ApproveEventRequest),
    });
  }

  /**
   * Reject an event
   */
  async rejectEvent(id: string, remarks: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks } as RejectEventRequest),
    });
  }

  /**
   * Get all event items
   */
  async getEventItems(): Promise<EventItemResponse[]> {
    return this.request<EventItemResponse[]>('/event-items', {
      method: 'GET',
    });
  }

  /**
   * Lookup postal code (optional feature)
   */
  async lookupPostalCode(code: string): Promise<{ streetName: string } | null> {
    try {
      return await this.request<{ streetName: string }>(`/postal-code/${code}`, {
        method: 'GET',
      });
    } catch {
      // Return null if lookup fails (allows manual entry)
      return null;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
