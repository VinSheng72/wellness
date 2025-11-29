import {
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  CreateEventRequest,
  UpdateEventRequest,
  CreateEventItemRequest,
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
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('accessToken');
    }
    return this.token;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    localStorage.setItem('refreshToken', token);
    
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
  }

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

      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
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
          this.clearTokens();
          window.location.href = '/login';
          
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

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

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

  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    this.setToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);

    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async getEvents(): Promise<EventResponse[]> {
    return this.request<EventResponse[]>('/events', {
      method: 'GET',
    });
  }

  async createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
    return this.request<EventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: UpdateEventRequest): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async approveEvent(id: string, confirmedDate: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ confirmedDate } as ApproveEventRequest),
    });
  }

  async rejectEvent(id: string, remarks: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks } as RejectEventRequest),
    });
  }

  async getEventItems(): Promise<EventItemResponse[]> {
    return this.request<EventItemResponse[]>('/event-items', {
      method: 'GET',
    });
  }

  async createEventItem(data: CreateEventItemRequest): Promise<EventItemResponse> {
    return this.request<EventItemResponse>('/event-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyEventItems(): Promise<EventItemResponse[]> {
    return this.request<EventItemResponse[]>('/event-items/my-items', {
      method: 'GET',
    });
  }

  async getEventsForEventItem(eventItemId: string): Promise<EventResponse[]> {
    return this.request<EventResponse[]>(`/events/event-item/${eventItemId}`, {
      method: 'GET',
    });
  }

  async lookupPostalCode(code: string): Promise<{ streetName: string } | null> {
    try {
      return await this.request<{ streetName: string }>(`/postal-code/${code}`, {
        method: 'GET',
      });
    } catch {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
