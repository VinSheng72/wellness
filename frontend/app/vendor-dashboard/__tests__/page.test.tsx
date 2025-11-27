/**
 * Component tests for Vendor Dashboard
 * Tests dashboard rendering with mocked API
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorDashboardPage from '../page';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getToken: jest.fn(),
    getEvents: jest.fn(),
    approveEvent: jest.fn(),
    rejectEvent: jest.fn(),
    clearTokens: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: {
      id: '456',
      username: 'vendor_admin',
      role: 'VENDOR_ADMIN',
      vendorId: 'vendor123',
    },
    isLoading: false,
    logout: jest.fn(),
  }),
}));

// Mock Toast component
jest.mock('@/app/components/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe('Vendor Dashboard', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (apiClient.getToken as jest.Mock).mockReturnValue('mock-token');
  });

  it('should render dashboard with events', async () => {
    const mockEvents = [
      {
        _id: '1',
        companyId: 'company123',
        eventItemId: 'item1',
        vendorId: 'vendor123',
        proposedDates: ['2024-01-01', '2024-01-02', '2024-01-03'],
        location: { postalCode: '12345', streetName: 'Main St' },
        status: 'Pending' as const,
        dateCreated: '2024-01-01T00:00:00.000Z',
        confirmedDate: null,
        remarks: null,
      },
    ];

    (apiClient.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Event Requests')).toBeInTheDocument();
    });

    expect(apiClient.getEvents).toHaveBeenCalled();
  });

  it('should display loading state initially', () => {
    (apiClient.getEvents as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<VendorDashboardPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error message on API failure', async () => {
    (apiClient.getEvents as jest.Mock).mockRejectedValue(
      new Error('Failed to load events')
    );

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    });
  });

  it('should show event requests table', async () => {
    (apiClient.getEvents as jest.Mock).mockResolvedValue([]);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Event Requests')).toBeInTheDocument();
    });
  });

  it('should display empty state when no events', async () => {
    (apiClient.getEvents as jest.Mock).mockResolvedValue([]);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Event Requests')).toBeInTheDocument();
    });
  });
});
