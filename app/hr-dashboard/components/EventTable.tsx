'use client';

import { useState } from 'react';
import EventModal from './EventModal';

/**
 * Serialized event type for client components
 */
export type SerializedEvent = {
  _id: string;
  companyId: { _id: string; name: string };
  eventItemId: { _id: string; name: string };
  vendorId: { _id: string; name: string };
  proposedDates: string[];
  location: {
    postalCode: string;
    streetName: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  confirmedDate: string | null;
  remarks: string | null;
  dateCreated: string;
};

type EventTableProps = {
  events: SerializedEvent[];
  userRole: 'HR_ADMIN' | 'VENDOR_ADMIN';
};

/**
 * EventTable Component
 * Displays events in a table format with all required columns
 * Requirements: 3.2, 3.3, 3.4
 */
export default function EventTable({ events, userRole }: EventTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<SerializedEvent | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDates = (event: SerializedEvent) => {
    // Show confirmed date if available, otherwise show proposed dates
    if (event.confirmedDate) {
      return formatDate(event.confirmedDate);
    }
    return event.proposedDates.map((date) => formatDate(date)).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No events found. Create your first event above.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Event Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date(s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {event.eventItemId.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {event.vendorId.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDates(event)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(event.dateCreated)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={userRole}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}
