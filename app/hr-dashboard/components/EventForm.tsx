'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type EventItem = {
  _id: string;
  name: string;
  vendorId: string;
  description?: string;
};

type EventFormProps = {
  companyName: string;
  companyId: string;
};

/**
 * EventForm Component for HR Admins
 * Auto-populates company name and allows creation of wellness events
 * Requirements: 2.1, 2.2, 2.3, 2.4, 8.1
 */
export default function EventForm({ companyName, companyId }: EventFormProps) {
  const router = useRouter();
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [selectedEventItem, setSelectedEventItem] = useState('');
  const [proposedDates, setProposedDates] = useState<string[]>(['', '', '']);
  const [postalCode, setPostalCode] = useState('');
  const [streetName, setStreetName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch event items on component mount
  useEffect(() => {
    const fetchEventItems = async () => {
      try {
        const response = await fetch('/api/event-items');
        if (response.ok) {
          const data = await response.json();
          setEventItems(data.eventItems || []);
        }
      } catch (err) {
        console.error('Failed to fetch event items:', err);
      }
    };

    fetchEventItems();
  }, []);

  // Postal code lookup
  const handlePostalCodeLookup = async () => {
    if (!postalCode.trim()) {
      return;
    }

    setIsLookingUp(true);
    try {
      const response = await fetch(`/api/postal-code/${postalCode.trim()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.streetName) {
          setStreetName(data.streetName);
        }
      }
    } catch (err) {
      console.error('Postal code lookup failed:', err);
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
      setError('Please select an event item');
      return false;
    }

    // Validate exactly 3 proposed dates
    const filledDates = proposedDates.filter((date) => date.trim() !== '');
    if (filledDates.length !== 3) {
      setError('Please provide exactly 3 proposed dates');
      return false;
    }

    // Validate location
    if (!postalCode.trim() || !streetName.trim()) {
      setError('Please provide both postal code and street name');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventItemId: selectedEventItem,
          proposedDates: proposedDates.map((date) => new Date(date).toISOString()),
          location: {
            postalCode: postalCode.trim(),
            streetName: streetName.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to create event');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Event created successfully!');
      
      // Reset form
      setSelectedEventItem('');
      setProposedDates(['', '', '']);
      setPostalCode('');
      setStreetName('');

      // Refresh the page to show the new event
      setTimeout(() => {
        router.refresh();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name (Auto-populated, read-only) */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          readOnly
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
        />
      </div>

      {/* Event Item Dropdown */}
      <div>
        <label htmlFor="eventItem" className="block text-sm font-medium text-gray-700">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          id="eventItem"
          value={selectedEventItem}
          onChange={(e) => setSelectedEventItem(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          required
        >
          <option value="">Select an event type</option>
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

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
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
