'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import EventTable from '@/components/EventTable';
import EventItemsManager from '@/components/EventItemsManager';
import { EventResponse } from '@/lib/api/types';
import { UserRole } from '@/lib/enums/user-role.enum';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { serializeEvents } from '@/lib/utils/event';

export default function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'items'>('items');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <Button
                onClick={() => setActiveTab('items')}
                variant="ghost"
                className={`${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap border-b-2 rounded-none py-4 px-1 text-sm font-medium transition-colors`}
              >
                My Event Items
              </Button>
              <Button
                onClick={() => setActiveTab('events')}
                variant="ghost"
                className={`${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap border-b-2 rounded-none py-4 px-1 text-sm font-medium transition-colors`}
              >
                Event Requests
              </Button>
            </nav>
          </div>

          {error && <ErrorMessage message={error} />}

          {activeTab === 'items' ? (
            <EventItemsManager />
          ) : (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Event Requests
              </h2>
              <EventTable events={serializedEvents} userRole={UserRole.VENDOR_ADMIN} onEventUpdate={fetchEvents} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
