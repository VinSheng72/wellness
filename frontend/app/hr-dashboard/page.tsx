'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import EventTable from './components/EventTable';
import EventForm from './components/EventForm';
import { EventResponse } from '@/lib/api/types';

/**
 * HR Admin Dashboard - Client Component
 * Fetches events for the authenticated user's company from NestJS backend
 * Requirements: 3.1, 3.2, 9.1, 9.3
 */
export default function HRDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'HR_ADMIN') {
      router.push('/vendor-dashboard');
      return;
    }

    fetchEvents();
  }, [user, authLoading, router]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = () => {
    fetchEvents();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Transform events to match the expected format for EventTable
  const serializedEvents = events.map((event) => ({
    _id: event._id,
    companyId: { _id: event.companyId, name: '' },
    eventItemId: { _id: event.eventItemId, name: '' },
    vendorId: { _id: event.vendorId, name: '' },
    proposedDates: event.proposedDates,
    location: event.location,
    status: event.status,
    confirmedDate: event.confirmedDate || null,
    remarks: event.remarks || null,
    dateCreated: event.dateCreated,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Event Creation Form */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Create New Event
            </h2>
            <EventForm onEventCreated={handleEventCreated} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Events Table */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Your Events
            </h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : (
              <EventTable events={serializedEvents} userRole="HR_ADMIN" onEventUpdate={fetchEvents} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
