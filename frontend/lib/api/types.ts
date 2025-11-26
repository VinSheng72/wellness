/**
 * API Types and Interfaces
 * These types match the DTOs from the NestJS backend
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: string;
    companyId?: string;
    vendorId?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateEventRequest {
  eventItemId: string;
  proposedDates: string[];
  location: {
    postalCode: string;
    streetName: string;
  };
}

export interface ApproveEventRequest {
  confirmedDate: string;
}

export interface RejectEventRequest {
  remarks: string;
}

export interface EventResponse {
  _id: string;
  companyId: string;
  eventItemId: string;
  vendorId: string;
  proposedDates: string[];
  location: {
    postalCode: string;
    streetName: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  confirmedDate?: string;
  remarks?: string;
  dateCreated: string;
  lastModified: string;
}

export interface EventItemResponse {
  _id: string;
  name: string;
  vendorId: string;
  description?: string;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errors?: any[];
}
