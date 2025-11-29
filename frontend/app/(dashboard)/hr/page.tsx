'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import EventTable from '@/components/EventTable';
import EventForm from '@/components/EventForm';
import EditEventModal from '@/components/EditEventModal';
import { EventResponse } from '@/lib/api/types';
import { SerializedEvent } from '@/components/EventTable';
import { UserRole } from '@/lib/enums/user-role.enum';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { serializeEvents } from '@/lib/utils/event';

export default function HRDashboardPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState<SerializedEvent | null>(null);

  const fetchEvents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventCreated = () => {
    fetchEvents();
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
    fetchEvents();
  };

  const handleEditEvent = (event: SerializedEvent) => {
    setEditingEvent(event);
  };

  const handleCloseEditModal = () => {
    setEditingEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="md" message="Loading dashboard..." />
      </div>
    );
  }

  const serializedEvents = serializeEvents(events);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Create New Event
            </h2>
            <EventForm onEventCreated={handleEventCreated} />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Your Events
            </h2>
            <EventTable 
              events={serializedEvents} 
              userRole={UserRole.HR_ADMIN} 
              onEventUpdate={fetchEvents}
              onEditEvent={handleEditEvent}
            />
          </div>
        </div>
      </main>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={handleCloseEditModal}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </div>
  );
}
