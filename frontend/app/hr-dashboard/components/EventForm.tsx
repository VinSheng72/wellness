'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/Toast';

type EventItem = {
  _id: string;
  name: string;
  vendorId: string;
  description?: string;
};

import { apiClient } from '@/lib/api';

type EventFormProps = {
  onEventCreated?: () => void;
};

/**
 * EventForm Component for HR Admins
 * Allows creation of wellness events using the NestJS backend API
 * Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 9.1, 9.3
 */
export default function EventForm({ onEventCreated }: EventFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [selectedEventItem, setSelectedEventItem] = useState('');
  const [proposedDates, setProposedDates] = useState<string[]>(['', '', '']);
  const [postalCode, setPostalCode] = useState('');
  const [streetName, setStreetName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');

  // Fetch event items on component mount
  useEffect(() => {
    const fetchEventItems = async () => {
      try {
        const data = await apiClient.getEventItems();
        setEventItems(data);
      } catch (err) {
        console.error('Failed to fetch event items:', err);
        showToast('Failed to load event types', 'error');
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchEventItems();
  }, [showToast]);

  // Postal code lookup
  const handlePostalCodeLookup = async () => {
    if (!postalCode.trim()) {
      showToast('Please enter a postal code first', 'warning');
      return;
    }

    setIsLookingUp(true);
    try {
      const data = await apiClient.lookupPostalCode(postalCode.trim());
      if (data && data.streetName) {
        setStreetName(data.streetName);
        showToast('Street name found!', 'success');
      } else {
        showToast('No street name found. Please enter manually.', 'info');
      }
    } catch (err) {
      console.error('Postal code lookup failed:', err);
      showToast('Postal code lookup unavailable. Please enter street name manually.', 'warning');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...proposedDates];
    newDates[index] = value;
    setProposedDates(newDates);
  };

  const validateForm = (): boolean => {
    // Validate event item selection
    if (!selectedEventItem) {
      const errorMsg = 'Please select an event type from the dropdown';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }

    // Validate exactly 3 proposed dates
    const filledDates = proposedDates.filter((date) => date.trim() !== '');
    if (filledDates.length === 0) {
      const errorMsg = 'Please provide 3 proposed dates for the event';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }
    if (filledDates.length < 3) {
      const errorMsg = `Please provide all 3 proposed dates (${filledDates.length}/3 provided)`;
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }

    // Validate dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDates = proposedDates.filter(date => {
      const proposedDate = new Date(date);
      return proposedDate < today;
    });
    if (pastDates.length > 0) {
      const errorMsg = 'All proposed dates must be in the future';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }

    // Validate location
    if (!postalCode.trim()) {
      const errorMsg = 'Please provide a postal code';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }
    if (!streetName.trim()) {
      const errorMsg = 'Please provide a street name (use Lookup button or enter manually)';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.createEvent({
        eventItemId: selectedEventItem,
        proposedDates: proposedDates.map((date) => new Date(date).toISOString()),
        location: {
          postalCode: postalCode.trim(),
          streetName: streetName.trim(),
        },
      });

      showToast('Event created successfully!', 'success');
      
      // Reset form
      setSelectedEventItem('');
      setProposedDates(['', '', '']);
      setPostalCode('');
      setStreetName('');
      setError('');

      // Notify parent component to refresh events
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Item Dropdown */}
      <div>
        <label htmlFor="eventItem" className="block text-sm font-medium text-gray-700">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          id="eventItem"
          value={selectedEventItem}
          onChange={(e) => setSelectedEventItem(e.target.value)}
          disabled={isLoadingItems}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">
            {isLoadingItems ? 'Loading event types...' : 'Select an event type'}
          </option>
          {eventItems.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Three Proposed Dates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proposed Dates (3 required) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <label htmlFor={`date-${index}`} className="block text-xs text-gray-600 mb-1">
                Date {index + 1}
              </label>
              <input
                id={`date-${index}`}
                type="date"
                value={proposedDates[index]}
                onChange={(e) => handleDateChange(index, e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Location with Postal Code Lookup */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Location <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              id="postalCode"
              type="text"
              placeholder="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="button"
            onClick={handlePostalCodeLookup}
            disabled={isLookingUp || !postalCode.trim()}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLookingUp ? 'Looking up...' : 'Lookup'}
          </button>
        </div>

        <div>
          <input
            id="streetName"
            type="text"
            placeholder="Street Name"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  );
}
