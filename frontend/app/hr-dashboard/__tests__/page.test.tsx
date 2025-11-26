/**
 * Component tests for HR Dashboard
 * Tests dashboard rendering with mocked API
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HRDashboardPage from '../page';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getToken: jest.fn(),
    getEvents: jest.fn(),
    getEventItems: jest.fn(),
    createEvent: jest.fn(),
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
      id: '123',
      username: 'hr_admin',
      role: 'HR_ADMIN',
      companyId: 'company123',
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

describe('HR Dashboard', () => {
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
        vendorId: 'vendor1',
        proposedDates: ['2024-01-01', '2024-01-02', '2024-01-03'],
        location: { postalCode: '12345', streetName: 'Main St' },
        status: 'Pending' as const,
        dateCreated: '2024-01-01T00:00:00.000Z',
        confirmedDate: null,
        remarks: null,
      },
    ];

    (apiClient.getEvents as jest.Mock).mockResolvedValue(mockEvents);
    (apiClient.getEventItems as jest.Mock).mockResolvedValue([]);

    render(<HRDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('HR Admin Dashboard')).toBeInTheDocument();
    });

    expect(apiClient.getEvents).toHaveBeenCalled();
  });

  it('should display loading state initially', () => {
    (apiClient.getEvents as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HRDashboardPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error message on API failure', async () => {
    (apiClient.getEvents as jest.Mock).mockRejectedValue(
      new Error('Failed to load events')
    );

    render(<HRDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    });
  });

  it('should show create event form', async () => {
    (apiClient.getEvents as jest.Mock).mockResolvedValue([]);
    (apiClient.getEventItems as jest.Mock).mockResolvedValue([]);

    render(<HRDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Create New Event')).toBeInTheDocument();
    });
  });

  it('should show events table', async () => {
    (apiClient.getEvents as jest.Mock).mockResolvedValue([]);
    (apiClient.getEventItems as jest.Mock).mockResolvedValue([]);

    render(<HRDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Your Events')).toBeInTheDocument();
    });
  });
});
