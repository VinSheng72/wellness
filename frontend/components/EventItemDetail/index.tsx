'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { EventResponse, EventItemResponse } from '@/lib/api/types';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EventCard } from './EventCard';
import { ApproveForm } from './ApproveForm';
import { RejectForm } from './RejectForm';

interface EventItemDetailProps {
  eventItemId: string;
  onBack: () => void;
}

export default function EventItemDetail({ eventItemId, onBack }: EventItemDetailProps) {
  const { showToast } = useToast();
  const [eventItem, setEventItem] = useState<EventItemResponse | null>(null);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [itemData, eventsData] = await Promise.all([
        apiClient.getEventItems().then(items => items.find(item => item._id === eventItemId)),
        apiClient.getEventsForEventItem(eventItemId),
      ]);

      if (!itemData) {
        setError('Event item not found');
        return;
      }

      setEventItem(itemData);
      setEvents(eventsData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventItemId]);

  const handleApprove = (event: EventResponse) => {
    setSelectedEvent(event._id);
    setIsApproving(true);
    setIsRejecting(false);
  };

  const handleReject = (event: EventResponse) => {
    setSelectedEvent(event._id);
    setIsRejecting(true);
    setIsApproving(false);
  };

  const confirmApprove = async (selectedDate: string) => {
    if (!selectedDate || !selectedEvent) {
      showToast('Please select a date to confirm', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.approveEvent(selectedEvent, selectedDate);
      showToast('Event approved successfully!', 'success');
      
      setIsApproving(false);
      setSelectedEvent(null);
      await fetchData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve event';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmReject = async (remarks: string) => {
    if (!remarks.trim() || !selectedEvent) {
      showToast('Please enter rejection remarks', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.rejectEvent(selectedEvent, remarks.trim());
      showToast('Event rejected successfully', 'success');
      
      setIsRejecting(false);
      setSelectedEvent(null);
      await fetchData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject event';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAction = () => {
    setIsApproving(false);
    setIsRejecting(false);
    setSelectedEvent(null);
  };

  const renderEvent = (event: EventResponse) => {
    const isSelected = selectedEvent === event._id;
    const showApproveForm = isSelected && isApproving;
    const showRejectForm = isSelected && isRejecting;

    return (
      <div key={event._id}>
        <EventCard
          event={event}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        
        {showApproveForm && (
          <ApproveForm
            event={event}
            onConfirm={confirmApprove}
            onCancel={cancelAction}
            isSubmitting={isSubmitting}
          />
        )}

        {showRejectForm && (
          <RejectForm
            onConfirm={confirmReject}
            onCancel={cancelAction}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="md" message="Loading..." className="py-12" />;
  }

  if (error || !eventItem) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Event item not found'}</p>
        <Button onClick={onBack} variant="link" className="mt-4">
          Back to Event Items
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="link" className="p-0 h-auto">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Event Items
      </Button>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{eventItem.name}</h2>
        {eventItem.description && (
          <p className="text-gray-600 mb-4">{eventItem.description}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Event Requests ({events.length})
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No event requests yet for this item.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(renderEvent)}
          </div>
        )}
      </div>
    </div>
  );
}
