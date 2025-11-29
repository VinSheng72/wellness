'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { EventItemResponse, CreateEventItemRequest } from '@/lib/api/types';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import EventItemsTable from './EventItemsTable';
import EventItemForm from './EventItemForm';
import EventItemDetail from './EventItemDetail';

type ViewMode = 'list' | 'create' | 'detail';

export default function EventItemsManager() {
  const { showToast } = useToast();
  const [eventItems, setEventItems] = useState<EventItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchEventItems();
  }, []);

  const fetchEventItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiClient.getMyEventItems();
      setEventItems(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load event items';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEventItem = async (data: CreateEventItemRequest) => {
    try {
      await apiClient.createEventItem(data);
      showToast('Event item created successfully!', 'success');
      
      await fetchEventItems();
      setViewMode('list');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create event item';
      showToast(errorMsg, 'error');
      throw err; 
    }
  };

  const handleViewEvents = (eventItemId: string) => {
    setSelectedItemId(eventItemId);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleCancel = () => {
    setViewMode('list');
  };

  const handleBack = () => {
    setSelectedItemId(null);
    setViewMode('list');
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <LoadingSpinner size="md" message="Loading event items..." className="py-12" />
      </div>
    );
  }

  if (error && eventItems.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={fetchEventItems}
            variant="link"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {viewMode === 'list' && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            My Event Items
          </h2>
          <EventItemsTable
            eventItems={eventItems}
            onViewEvents={handleViewEvents}
            onCreateNew={handleCreateNew}
          />
        </>
      )}

      {viewMode === 'create' && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Create New Event Item
          </h2>
          <EventItemForm
            onSubmit={handleCreateEventItem}
            onCancel={handleCancel}
          />
        </>
      )}

      {viewMode === 'detail' && selectedItemId && (
        <EventItemDetail
          eventItemId={selectedItemId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
